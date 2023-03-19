const CREATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS server_configs (
        guild_id TEXT PRIMARY KEY,
        prefix TEXT NOT NULL,
        enabled_bots TEXT NOT NULL,
        blacklist TEXT NOT NULL
    )
`;

module.exports = {
    up: CREATE_TABLE_SQL
};