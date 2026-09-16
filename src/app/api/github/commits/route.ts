const repository = {
  owner: "lahlahai",
  name: "Analysis-Department-OS",
  branch: "main",
};

interface GitHubCommitResponse {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: { name?: string; date?: string };
  };
  author?: {
    login?: string;
    avatar_url?: string;
    html_url?: string;
  };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "so-engineer-workspace",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.name}/commits?sha=${repository.branch}&per_page=8`, { headers, next: { revalidate: 60 } });
    if (!response.ok) {
      const rateLimited = response.status === 403 || response.status === 429;
      return Response.json({ error: rateLimited ? "تم بلوغ حد طلبات GitHub. أضف GITHUB_TOKEN لرفع الحد." : "تعذر جلب سجل GitHub.", rateLimited }, { status: rateLimited ? 429 : 502, headers: { "Cache-Control": "no-store" } });
    }

    const commits = await response.json() as GitHubCommitResponse[];
    return Response.json({ repository: { ...repository, url: `https://github.com/${repository.owner}/${repository.name}` }, commits: commits.map((item) => ({
      sha: item.sha,
      shortSha: item.sha.slice(0, 7),
      url: item.html_url,
      message: item.commit.message.split("\n")[0],
      user: item.author?.login ?? item.commit.author?.name ?? "مستخدم GitHub",
      userName: item.commit.author?.name ?? item.author?.login ?? "مستخدم GitHub",
      avatarUrl: item.author?.avatar_url ?? null,
      userUrl: item.author?.html_url ?? null,
      date: item.commit.author?.date ?? null,
    })) }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ error: "تعذر الاتصال بخدمة GitHub حاليًا.", rateLimited: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
