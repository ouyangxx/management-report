-- 创建共享配置表
CREATE TABLE IF NOT EXISTS shared_config_entries (
  org_key TEXT PRIMARY KEY,
  path_json TEXT NOT NULL,
  config_json TEXT NOT NULL,
  rows_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_updated_at ON shared_config_entries(updated_at);
