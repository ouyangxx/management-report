import { env } from "cloudflare:workers";

type RuntimeEnv = {
  DB?: D1Database;
};

type StoredEntryRow = {
  org_key: string;
  path_json: string;
  config_json: string;
  rows_json: string;
  updated_at: string;
};

export type SharedEntry = {
  path: string[];
  config: unknown;
};

export const EXPORT_HEADERS = [
  "经营体链路",
  "经营类型",
  "业态",
  "品牌",
  "类目",
  "系列",
  "SPU",
  "SKU",
  "平台",
  "店铺",
  "仓库",
  "来源",
  "分销员(工号)",
  "分销员(姓名)",
  "客户名称",
  "开票主体（公司名称）",
  "是否直播（0未直播，1直播）",
  "直播UID",
  "BD工号",
  "BD人名",
  "服务商（BD公司名称）",
  "供应商（公司名称）",
  "国家/地区",
  "省份",
  "地市",
  "区县",
];

function runtimeEnv() {
  return env as unknown as RuntimeEnv;
}

export function getDatabase() {
  const db = runtimeEnv().DB;
  if (!db) throw new Error("共享配置数据库暂不可用");
  return db;
}

export async function ensureSharedConfigTable() {
  const db = getDatabase();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS shared_config_entries (
        org_key TEXT PRIMARY KEY,
        path_json TEXT NOT NULL,
        config_json TEXT NOT NULL,
        rows_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();
}

export async function listStoredEntries() {
  await ensureSharedConfigTable();
  const result = await getDatabase()
    .prepare(
      `SELECT org_key, path_json, config_json, rows_json, updated_at
       FROM shared_config_entries
       ORDER BY org_key`
    )
    .all<StoredEntryRow>();
  return result.results || [];
}

export function entriesToSaved(rows: StoredEntryRow[]) {
  const saved: Record<string, SharedEntry> = {};
  rows.forEach((row) => {
    saved[row.org_key] = {
      path: JSON.parse(row.path_json),
      config: JSON.parse(row.config_json),
    };
  });
  return saved;
}

export async function replaceStoredEntry(orgKey: string, entry: SharedEntry, rows: string[][]) {
  await ensureSharedConfigTable();
  const now = new Date().toISOString();
  await getDatabase()
    .prepare(
      `INSERT OR REPLACE INTO shared_config_entries
       (org_key, path_json, config_json, rows_json, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      orgKey,
      JSON.stringify(entry.path || []),
      JSON.stringify(entry.config || {}),
      JSON.stringify(rows || []),
      now
    )
    .run();
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[char] || char;
  });
}

export function buildSharedExcel(rowsByEntry: StoredEntryRow[]) {
  const rows: string[][] = [EXPORT_HEADERS];
  rowsByEntry.forEach((entry) => {
    const parsedRows = JSON.parse(entry.rows_json) as string[][];
    parsedRows.forEach((row) => rows.push(row));
  });
  while (rows.length < 19) rows.push(EXPORT_HEADERS.map(() => ""));

  const widths = [
    320, 160, 190, 180, 180, 180, 180, 160, 160, 160, 220, 160, 160, 170, 170,
    220, 240, 220, 150, 160, 240, 240, 180, 150, 150, 150,
  ];
  const colgroup = EXPORT_HEADERS.map(
    (_, index) => `<col style="width:${widths[index] || 160}px">`
  ).join("");
  const table = rows
    .map((row, rowIndex) => {
      const tag = rowIndex === 0 ? "th" : "td";
      return `<tr>${row.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join("")}</tr>`;
    })
    .join("");
  return `<!doctype html><html><head><meta charset="UTF-8"><style>
    table { border-collapse: collapse; table-layout: fixed; font-family: "Microsoft YaHei", Arial, sans-serif; }
    th { height: 30px; background: #08a9e8; color: #ffffff; font-size: 16px; font-weight: 700; text-align: left; vertical-align: middle; border: 1px solid #e6e6e6; padding: 3px 6px; mso-number-format: "\\@"; }
    td { height: 28px; color: #222222; font-size: 12px; text-align: left; vertical-align: middle; border: 1px solid #e6e6e6; padding: 2px 6px; mso-number-format: "\\@"; }
  </style></head><body><table>${colgroup}${table}</table></body></html>`;
}
