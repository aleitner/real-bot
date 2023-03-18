const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ServerConfig = require('./serverConfig');

class DatabaseManager {
    constructor() {
        this.setupDatabaseConnection();
        this.initializeDatabase();
    }

    setupDatabaseConnection() {
        const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL : path.join(__dirname, '..', '..', 'data', 'development.sqlite');
        if (!dbUrl) {
            throw new Error('DATABASE_URL environment variable not set');
        }
        this.db = new sqlite3.Database(dbUrl, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });
    }

    initializeDatabase() {
        return this.run(this.CREATE_TABLE_SQL());
    }

    CREATE_TABLE_SQL() {
        return `
            CREATE TABLE IF NOT EXISTS server_configs (
                guild_id TEXT PRIMARY KEY,
                prefix TEXT NOT NULL,
                enabled_bots TEXT NOT NULL
            )
        `;
    }

    SELECT_SERVER_CONFIG_SQL() {
        return 'SELECT * FROM server_configs WHERE guild_id = ?';
    }

    REPLACE_SERVER_CONFIG_SQL() {
        return `
            REPLACE INTO server_configs (guild_id, prefix, enabled_bots)
            VALUES (?, ?, ?)
        `;
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.error('Error running sql', sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.error('Error running sql', sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error running sql', sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async loadServerConfig(guildId) {
        const config = await this.get(this.SELECT_SERVER_CONFIG_SQL(), [guildId]);

        if (config) {
            const serverConfig = new ServerConfig(guildId);
            serverConfig.prefix = config.prefix;
            serverConfig.enabledBots = new Set(JSON.parse(config.enabled_bots));
            return serverConfig;
        } else {
            const newConfig = new ServerConfig(guildId, ['ChatGPTBot']);
            await this.saveServerConfig(newConfig);
            return newConfig;
        }
    }

    async saveServerConfig(serverConfig) {
        const params = [
            serverConfig.guildId,
            serverConfig.prefix,
            JSON.stringify(Array.from(serverConfig.enabledBots)),
        ];

        await this.run(this.REPLACE_SERVER_CONFIG_SQL(), params);
    }
}

module.exports = DatabaseManager;