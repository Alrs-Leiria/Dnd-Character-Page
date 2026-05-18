const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database("backend/database.db");

console.log("Connected to database.");

db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

const migrationsPath = path.join(__dirname, "migrations");

const migrationFiles = fs
    .readdirSync(migrationsPath)
    .filter(file => file.endsWith(".sql"))
    .sort();

for (const file of migrationFiles) {

    const migrationAlreadyExecuted = db
        .prepare(`
            SELECT id
            FROM migrations
            WHERE name = ?
        `)
        .get(file);

    if (migrationAlreadyExecuted) {
        console.log(`Skipping ${file}`);
        continue;
    }

    console.log(`Running ${file}`);

    const sql = fs.readFileSync(
        path.join(migrationsPath, file),
        "utf8"
    );

    try {

        db.exec(sql);

        db.prepare(`
            INSERT INTO migrations (name)
            VALUES (?)
        `).run(file);

        console.log(`Finished ${file}`);

    } catch (error) {

        console.error(`Error in ${file}`);
        console.error(error.message);

        process.exit(1);
    }
}

console.log("All migrations completed.");

db.close();