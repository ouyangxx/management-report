import {
  entriesToMeta,
  entriesToSaved,
  listStoredEntries,
  replaceStoredEntry,
  type SharedEntry,
} from "../../../lib/shared-config";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRows(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray);
}

export async function GET() {
  try {
    const rows = await listStoredEntries();
    return Response.json(
      { saved: entriesToSaved(rows), meta: entriesToMeta(rows) },
      { headers: JSON_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "共享配置加载失败";
    return Response.json({ error: message }, { status: 500, headers: JSON_HEADERS });
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
    const people = payload.entry && payload.entry.config && typeof payload.entry.config === "object"
      ? (payload.entry.config as { people?: unknown }).people
      : [];
    const hasPeople = Array.isArray(people) && people.length > 0;
    if (!payload.rows.length && !hasPeople) {
      return Response.json(
        { error: "当前经营体没有可保存的产权或人员配置，已拒绝空配置覆盖" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    await replaceStoredEntry(key, payload.entry, payload.rows);
    const rows = await listStoredEntries();
    return Response.json(
      { saved: entriesToSaved(rows), meta: entriesToMeta(rows) },
      { headers: JSON_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "确认配置失败";
    return Response.json({ error: message }, { status: 500, headers: JSON_HEADERS });
  }
}
