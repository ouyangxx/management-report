import {
  buildSharedExcel,
  listStoredEntries,
} from "../../../../lib/shared-config";

const DOWNLOAD_HEADERS = {
  "Content-Type": "application/vnd.ms-excel; charset=utf-8",
  "Content-Disposition":
    "attachment; filename*=UTF-8''%E5%B7%B2%E9%85%8D%E7%BD%AE%E7%BB%8F%E8%90%A5%E4%BD%93%E4%BA%A7%E6%9D%83.xls",
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const rows = await listStoredEntries();
    return new Response(buildSharedExcel(rows), { headers: DOWNLOAD_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "共享配置文件下载失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
