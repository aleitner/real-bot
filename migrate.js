const MigrationManager = require('./src/db/migrationManager');
const path = require('path');

const databasePath = process.env.DATABASE_URL ? process.env.DATABASE_URL : path.join(__dirname, '..', '..', 'data', 'development.sqlite');
const mm = new MigrationManager(databasePath);
mm.migrateUp().then(() => {
    console.log('Migration successful.');
}).catch((error) => {
    console.error('Migration failed:', error);
});