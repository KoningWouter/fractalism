import { SimplePool, nip19 } from 'nostr-tools';
import WebSocket from 'ws';
global.WebSocket = WebSocket;

const pool = new SimplePool();
const relays = [
	'wss://relay.damus.io',
	'wss://nos.lol',
	'wss://relay.primal.net',
	'wss://relay.snort.social',
];

async function debug() {
    console.log('Searching for lowercase #oubliette events...');
    try {
        const events = await pool.querySync(relays, {
            kinds: [1],
            '#t': ['oubliette'],
            limit: 10
        });
        console.log('Found ' + events.length + ' events.');
        events.forEach(e => {
            console.log('---');
            console.log('Content: ' + e.content);
        });
    } catch (err) {
        console.error(err);
    } finally {
        pool.close(relays);
        process.exit(0);
    }
}

debug();
