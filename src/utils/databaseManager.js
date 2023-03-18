const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ServerConfig = require('./serverConfig');

class DatabaseManager {
    static CREATE_TABLE_SQL = `
        CREATE TABLE IF NOT EXISTS server_configs (
            guild_id TEXT PRIMARY KEY,
            prefix TEXT NOT NULL,
            enabled_bots TEXT NOT NULL
        )
    `;

    static SELECT_SERVER_CONFIG_SQL = 'SELECT * FROM server_configs WHERE guild_id = ?';

    static REPLACE_SERVER_CONFIG_SQL = `
        REPLACE INTO server_configs (guild_id, prefix, enabled_bots)
        VALUES (?, ?, ?)
    `;

    constructor(databaseName = 'botDatabase.sqlite') {
        this.db = new sqlite3.Database(
            path.join(__dirname, '..', '..','data', databaseName),
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('Connected to the SQLite database.');
                }
            }
        );

        this.initializeDatabase();
    }

    initializeDatabase() {
        return this.run(DatabaseManager.CREATE_TABLE_SQL);
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
        const config = await this.get(DatabaseManager.SELECT_SERVER_CONFIG_SQL, [guildId]);
    
        if (config) {
            const serverConfig = new ServerConfig(guildId);
            serverConfig.prefix = config.prefix;
            serverConfig.enabledBots = new Set(JSON.parse(config.enabled_bots));
            return serverConfig;
        } else {
            // If no config is found, create a new one and save it to the database
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
    
        await this.run(DatabaseManager.REPLACE_SERVER_CONFIG_SQL, params);
    }
}

module.exports = DatabaseManager;