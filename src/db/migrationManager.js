const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const DatabaseManager = require('./databaseManager');

class MigrationManager {
    constructor(databasePath) {
        this.db = new DatabaseManager(databasePath);
    }

    async migrateUp() {
        const migrationFiles = fs.readdirSync(path.join(__dirname, '..', '..', 'migrations')).sort();
        for (const file of migrationFiles) {
            console.log(`Running migration for ${file}.`)
            const migration = require(path.join(__dirname, '..', '..', 'migrations', file));
            await this.db.run(migration.up);
        }
    }

}

module.exports = MigrationManager;