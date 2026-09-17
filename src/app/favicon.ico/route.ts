import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const logo = await readFile(join(process.cwd(), "public", "brand", "site-logo.png"));
  return new Response(logo, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
