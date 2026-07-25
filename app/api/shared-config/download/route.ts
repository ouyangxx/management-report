import {
  getBucket,
  SHARED_FILE_KEY,
  writeSharedExcel,
} from "../../../../lib/shared-config";

const DOWNLOAD_HEADERS = {
  "Content-Type": "application/vnd.ms-excel; charset=utf-8",
  "Content-Disposition":
    "attachment; filename*=UTF-8''%E5%B7%B2%E9%85%8D%E7%BD%AE%E7%BB%8F%E8%90%A5%E4%BD%93%E4%BA%A7%E6%9D%83.xls",
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const bucket = getBucket();
    let object = await bucket.get(SHARED_FILE_KEY);
    if (!object) {
      await writeSharedExcel();
      object = await bucket.get(SHARED_FILE_KEY);
    }
    if (!object) {
      return Response.json({ error: "共享配置文件暂不可用" }, { status: 404 });
    }
    return new Response(object.body, { headers: DOWNLOAD_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "共享配置文件下载失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
