require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function run() {

    const connection =
        await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

    const dir =
        path.join(
            __dirname,
            "..",
            "migrations"
        );

    const files =
        fs.readdirSync(dir)
            .filter(x => x.endsWith(".sql"))
            .sort();

    for (const file of files) {

        const sql =
            fs.readFileSync(
                path.join(dir, file),
                "utf8"
            );

        await connection.query(sql);

        console.log(`Executed ${file}`);
    }

    await connection.end();
}

run().catch(console.error);

