const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#003b36"/><path d="M16 19h32v8H25v7h19v8H25v8h23v8H16z" fill="#e0c98d"/><circle cx="48" cy="16" r="5" fill="#b49a63"/></svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
