const repository = {
  owner: "lahlahai",
  name: "Analysis-Department-OS",
  branch: "main",
};

const githubApiBase = "https://api.github.com";
const maxFilesPerCommit = 100;
const maxFileSize = 1024 * 1024;

type FileMap = Record<string, string>;

interface GitHubReference {
  object: { sha: string };
}

interface GitHubCommitDetails {
  tree: { sha: string };
}

interface GitHubTree {
  sha: string;
}

interface GitHubBlob {
  sha: string;
}

interface GitHubCommit {
  sha: string;
  html_url: string;
}

class GitHubApiError extends Error {
  constructor(public readonly status: number) {
    super("GitHub API request failed");
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSafeWorkspacePath(path: string) {
  if (!path || path.length > 240 || path.startsWith("/") || path.includes("\\")) return false;
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return false;
  if (path.startsWith(".env") || path.startsWith(".git/") || path.startsWith("node_modules/")) return false;
  if (path === "package.json" || path === "package-lock.json" || path.startsWith("src/") || path.startsWith("public/")) return false;
  return true;
}

function isFileMap(value: unknown): value is FileMap {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.entries(value as Record<string, unknown>).every(([path, content]) => (
    isSafeWorkspacePath(path) && typeof content === "string" && Buffer.byteLength(content, "utf8") <= maxFileSize
  ));
}

function isPathList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((path) => typeof path === "string" && isSafeWorkspacePath(path));
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "analysis-department-workspace",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${githubApiBase}${path}`, {
    ...init,
    headers: { ...githubHeaders(token), ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  if (!response.ok) throw new GitHubApiError(response.status);
  return await response.json() as T;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return errorResponse("لم يتم ضبط GITHUB_TOKEN على الخادم.", 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("بيانات الحفظ غير صالحة.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("بيانات الحفظ غير صالحة.", 400);
  const payload = body as { files?: unknown; deletedPaths?: unknown; message?: unknown };
  const files = payload.files;
  const deletedPaths = payload.deletedPaths ?? [];
  const message = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim().slice(0, 120) : "تحديث ملفات مساحة العمل";

  if (!isFileMap(files) || !isPathList(deletedPaths)) return errorResponse("يحتوي الطلب على مسار أو ملف غير مسموح.", 400);
  const paths = [...Object.keys(files), ...deletedPaths.filter((path) => !(path in files))];
  if (paths.length === 0) return errorResponse("لا توجد تغييرات لحفظها.", 400);
  if (paths.length > maxFilesPerCommit) return errorResponse(`يمكن حفظ ${maxFilesPerCommit} ملفًا كحد أقصى في العملية الواحدة.`, 400);

  try {
    const ref = await githubRequest<GitHubReference>(token, `/repos/${repository.owner}/${repository.name}/git/ref/heads/${repository.branch}`);
    const parentSha = ref.object.sha;
    const parentCommit = await githubRequest<GitHubCommitDetails>(token, `/repos/${repository.owner}/${repository.name}/git/commits/${parentSha}`);

    const treeEntries: Array<{ path: string; mode: "100644"; type: "blob"; sha: string | null }> = [];
    for (const [path, content] of Object.entries(files)) {
      const blob = await githubRequest<GitHubBlob>(token, `/repos/${repository.owner}/${repository.name}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content, encoding: "utf-8" }),
      });
      treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
    }
    for (const path of deletedPaths) {
      if (!(path in files)) treeEntries.push({ path, mode: "100644", type: "blob", sha: null });
    }

    const tree = await githubRequest<GitHubTree>(token, `/repos/${repository.owner}/${repository.name}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeEntries }),
    });
    const commit = await githubRequest<GitHubCommit>(token, `/repos/${repository.owner}/${repository.name}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
    });
    await githubRequest(token, `/repos/${repository.owner}/${repository.name}/git/refs/heads/${repository.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    return Response.json({ ok: true, commit: { sha: commit.sha, url: commit.html_url, message }, savedPaths: paths }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      if (error.status === 401 || error.status === 403) return errorResponse("رمز GitHub غير صالح أو لا يملك صلاحية Contents: Read and write.", 502);
      if (error.status === 409) return errorResponse("تغير المستودع أثناء الحفظ. حدّث الصفحة ثم حاول مرة أخرى.", 409);
    }
    return errorResponse("تعذر حفظ الملفات داخل مستودع GitHub.", 502);
  }
}
