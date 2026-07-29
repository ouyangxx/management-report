import { env } from "cloudflare:workers";
import { strToU8, zipSync } from "fflate";

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

const PEOPLE_HEADERS = ["经营体链路", "员工工号", "员工姓名"];

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

export function entriesToMeta(rows: StoredEntryRow[]) {
  const meta: Record<string, { updatedAt: string }> = {};
  rows.forEach((row) => {
    meta[row.org_key] = { updatedAt: row.updated_at };
  });
  return meta;
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

function parseRows(value: string) {
  try {
    const rows = JSON.parse(value) as unknown;
    return Array.isArray(rows) ? rows.filter(Array.isArray).map((row) => row.map((cell) => String(cell ?? ""))) : [];
  } catch {
    return [];
  }
}

function parseConfig(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}

function peopleFromConfig(config: unknown) {
  if (!config || typeof config !== "object") return [];
  const maybePeople = (config as { people?: unknown }).people;
  if (!Array.isArray(maybePeople)) return [];
  return maybePeople
    .map((person) => ({
      code: String((person as { code?: unknown })?.code ?? "").trim(),
      name: String((person as { name?: unknown })?.name ?? "").trim(),
    }))
    .filter((person) => person.code || person.name);
}

function escapeXml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return replacements[char] || char;
  });
}

function colName(index: number) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function worksheetXml(rows: string[][]) {
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, colIndex) => {
          const ref = `${colName(colIndex)}${rowIndex + 1}`;
          const style = rowIndex === 0 ? ' s="1"' : "";
          return `<c r="${ref}" t="inlineStr"${style}><is><t>${escapeXml(cell)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
}

function workbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="产权配置" sheetId="1" r:id="rId1"/><sheet name="人员配置" sheetId="2" r:id="rId2"/></sheets></workbook>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Microsoft YaHei"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Microsoft YaHei"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF08A9E8"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="49" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>`;
}

export function buildSharedWorkbook(rowsByEntry: StoredEntryRow[]) {
  const propertyRows: string[][] = [EXPORT_HEADERS];
  const peopleRows: string[][] = [PEOPLE_HEADERS];

  rowsByEntry.forEach((entry) => {
    parseRows(entry.rows_json).forEach((row) => propertyRows.push(row));
    const config = parseConfig(entry.config_json);
    const people = peopleFromConfig(config);
    if (people.length) {
      peopleRows.push([
        entry.org_key,
        people.map((person) => person.code).filter(Boolean).join(","),
        people.map((person) => person.name).filter(Boolean).join(","),
      ]);
    }
  });
  while (propertyRows.length < 19) propertyRows.push(EXPORT_HEADERS.map(() => ""));

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    "xl/workbook.xml": strToU8(workbookXml()),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(worksheetXml(propertyRows)),
    "xl/worksheets/sheet2.xml": strToU8(worksheetXml(peopleRows)),
    "xl/styles.xml": strToU8(stylesXml()),
  };

  return zipSync(files, { level: 6 });
}
