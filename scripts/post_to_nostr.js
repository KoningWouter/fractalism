import { finalizeEvent, nip19 } from 'nostr-tools';
import { Relay } from 'nostr-tools/relay';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from ~/.hermes/.env
const envContent = fs.readFileSync(path.join(process.env.HOME, '.hermes/.env'), 'utf8');
const NOSTR_SECKEY = envContent.split('\n').find(line => line.startsWith('NOSTR_SECKEY=')).split('=')[1].trim();

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://relay.snort.social'
];

async function post() {
    const ammoPath = path.join(__dirname, '../src/data/gatling_gun_ammo.json');
    const ammo = JSON.parse(fs.readFileSync(ammoPath, 'utf8'));
    
    // Pick a random round
    const round = ammo[Math.floor(Math.random() * ammo.length)];
    const message = `${round.text}\n\n${round.url}`;
    
    console.log(`Firing truth: "${message}"`);

    const decoded = nip19.decode(NOSTR_SECKEY);
    const sk = decoded.data;

    const event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['t', 'fractalism'], ['t', 'gnosis']],
        content: message,
    }, sk);

    let publishedCount = 0;
    for (const url of RELAYS) {
        try {
            const relay = await Relay.connect(url);
            await relay.publish(event);
            console.log(`Published to ${url}`);
            publishedCount++;
            relay.close();
        } catch (e) {
            console.error(`Failed to publish to ${url}:`, e.message);
        }
    }
    
    if (publishedCount === 0) {
        process.exit(1);
    }
}

post().catch(err => {
    console.error(err);
    process.exit(1);
});
