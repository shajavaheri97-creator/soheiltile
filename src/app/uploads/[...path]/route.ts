import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "@/db";

const NAME = /^[a-f0-9]{32}-(480|960|1600)\.webp$/;
const KINDS = new Set(["products", "projects"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const [kind, name, ...rest] = (await params).path;
  if (rest.length || !KINDS.has(kind) || !NAME.test(name ?? "")) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const buf = await fs.readFile(path.join(/*turbopackIgnore: true*/ DATA_DIR, "uploads", kind, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
