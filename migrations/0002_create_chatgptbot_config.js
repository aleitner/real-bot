const CREATE_CHATGPTBOT_CONFIG_TABLE = `
    CREATE TABLE IF NOT EXISTS chatgptbot_config (
      serverId INTEGER PRIMARY KEY,
      serverContext TEXT,
      serverMessageHistory TEXT,
      maxHistoryLength INTEGER,
      temperature INTEGER,
      max_tokens INTEGER,
      n INTEGER,
      adminRoles TEXT
    )
`;

module.exports = {
    up: CREATE_CHATGPTBOT_CONFIG_TABLE
};