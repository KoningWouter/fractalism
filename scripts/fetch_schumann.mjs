import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = '/home/wouter/Development/fractalism_astro/fractalism.db';

async function fetchFieldData() {
    try {
        // 1. Fetch Baseline Schumann (The "Daily Vibe")
        const schuRes = await fetch('https://www.disclosurenews.it/schumann-resonance-today-update/');
        const schuText = await schuRes.text();
        const basePowerMatch = schuText.match(/reach(?:ed)? a maximum \*\*Power of (\d+)\*\*/i) || [0, "78"];
        const basePower = parseInt(basePowerMatch[1]);

        // 2. Fetch Live Kp-Index (The "Real-time Pressure")
        const kpRes = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
        const kpData = await kpRes.json();
        const latestKp = kpData[kpData.length - 1].Kp;

        // 3. Fetch Solar Wind (The "Jitter/Breath")
        const windRes = await fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json');
        const windData = await windRes.json();
        const latestWind = parseFloat(windData[windData.length - 1][2]) || 400;

        // --- Hybrid Logic ---
        // Frequency shifts slightly based on solar wind speed (vloeibare gnosis)
        const jitter = (latestWind - 400) / 10000; 
        const freq = (7.83 + jitter + (Math.random() * 0.04 - 0.02)).toFixed(2);
        
        // Power is modulated by Kp-Index
        // Base power + (Kp * 5)
        const power = (basePower + (latestKp * 3) + (Math.random() * 2 - 1)).toFixed(1);

        const db = new sqlite3.Database(DB_PATH);

        db.serialize(() => {
            db.run(`INSERT INTO schumann_history (power, freq, kp) VALUES (?, ?, ?)`, 
                [parseFloat(power), parseFloat(freq), parseFloat(latestKp)]);

            db.all(`SELECT power FROM schumann_history ORDER BY timestamp DESC LIMIT 48`, (err, rows) => {
                const history = rows.map(r => r.power).reverse();
                const data = {
                    power: power,
                    freq: freq,
                    kp: latestKp,
                    status: "LIVE FIELD",
                    history: history
                };
                process.stdout.write(JSON.stringify(data));
                db.close();
            });
        });

    } catch (e) {
        process.stderr.write(e.message);
        process.exit(1);
    }
}

fetchFieldData();
