import { finalizeEvent, nip19 } from 'nostr-tools';
import { Relay } from 'nostr-tools/relay';
import fs from 'fs';
import path from 'path';

const NOSTR_SECKEY_PATH = path.join(process.env.HOME, '.hermes/.env');

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://relay.snort.social'
];

async function post() {
    const text = process.argv[2];
    if (!text) {
        console.error("Usage: node post_custom.js <text>");
        process.exit(1);
    }

    const envContent = fs.readFileSync(NOSTR_SECKEY_PATH, 'utf8');
    const NOSTR_SECKEY = envContent.split('\n').find(line => line.startsWith('NOSTR_SECKEY=')).split('=')[1].trim();

    const decoded = nip19.decode(NOSTR_SECKEY);
    const sk = decoded.data;

    const event = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['t', 'fractalism'], ['t', 'gnosis'], ['t', 'source']],
        content: text,
    }, sk);

    console.log(`Firing truth to Nostr: "${text}"`);

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
