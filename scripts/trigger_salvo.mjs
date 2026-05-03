import fs from 'fs';
import { execSync } from 'child_process';
import sqlite3 from 'sqlite3';

const DB_PATH = '/home/wouter/Development/fractalism_astro/fractalism.db';
const POST_SCRIPT = '/home/wouter/Development/fractalism_astro/scripts/post_to_nostr_custom.mjs';

async function triggerSalvo() {
    const db = new sqlite3.Database(DB_PATH);

    db.get('SELECT id, text, url FROM gatling_ammo ORDER BY RANDOM() LIMIT 1;', async (err, row) => {
        if (err || !row) {
            process.stdout.write(JSON.stringify({ success: false, error: "Database empty or error" }));
            db.close();
            return;
        }

        const { id, text, url } = row;
        const message = `${text}\n\n${url}`;
        
        try {
            const cmd = `node ${POST_SCRIPT} "${message.replace(/"/g, '\\"')}"`;
            execSync(cmd, { timeout: 20000, stdio: 'pipe' });
            
            db.serialize(() => {
                db.run(`UPDATE gatling_ammo SET used_count = used_count + 1 WHERE id = ?`, [id]);
                db.run(`INSERT INTO dispatches (content, platform, success) VALUES (?, ?, ?)`, [text, 'nostr', 1]);
                db.get(`SELECT COUNT(*) as count FROM gatling_ammo`, (err, countRow) => {
                    process.stdout.write(JSON.stringify({ 
                        success: true, 
                        text: text, 
                        count: countRow.count 
                    }));
                    db.close();
                });
            });
        } catch (e) {
            const output = e.stdout ? e.stdout.toString() : "";
            if (output.includes("Published to")) {
                db.serialize(() => {
                    db.run(`UPDATE gatling_ammo SET used_count = used_count + 1 WHERE id = ?`, [id]);
                    db.run(`INSERT INTO dispatches (content, platform, success) VALUES (?, ?, ?)`, [text, 'nostr', 1]);
                    db.get(`SELECT COUNT(*) as count FROM gatling_ammo`, (err, countRow) => {
                        process.stdout.write(JSON.stringify({ 
                            success: true, 
                            text: text, 
                            count: countRow.count 
                        }));
                        db.close();
                    });
                });
            } else {
                process.stdout.write(JSON.stringify({ success: false, error: "Relay failure" }));
                db.close();
            }
        }
    });
}

triggerSalvo();
