import {
  buildSharedWorkbook,
  listStoredEntries,
} from "../../../../lib/shared-config";

const FILENAME = "已确认经营体产权&人员配置20260729.xlsx";
const DOWNLOAD_HEADERS = {
  "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(FILENAME)}`,
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const rows = await listStoredEntries();
    return new Response(buildSharedWorkbook(rows), { headers: DOWNLOAD_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "共享配置文件下载失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
