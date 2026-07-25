import {
  entriesToSaved,
  listStoredEntries,
  replaceStoredEntry,
  writeSharedExcel,
  type SharedEntry,
} from "../../../lib/shared-config";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRows(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray);
}

export async function GET() {
  try {
    const rows = await listStoredEntries();
    return Response.json({ saved: entriesToSaved(rows) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "共享配置加载失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      key?: string;
      entry?: SharedEntry;
      rows?: string[][];
    };
    const key = String(payload.key || "").trim();
    if (!key) return Response.json({ error: "缺少经营体链路" }, { status: 400 });
    if (!payload.entry || !Array.isArray(payload.entry.path)) {
      return Response.json({ error: "缺少产权配置" }, { status: 400 });
    }
    if (!isRows(payload.rows)) {
      return Response.json({ error: "导出行格式不正确" }, { status: 400 });
    }

    await replaceStoredEntry(key, payload.entry, payload.rows);
    await writeSharedExcel();
    const rows = await listStoredEntries();
    return Response.json({ saved: entriesToSaved(rows) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "确认配置失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
