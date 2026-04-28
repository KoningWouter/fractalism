import { finalizeEvent, nip19 } from 'nostr-tools';
import { Relay } from 'nostr-tools/relay';
import fs from 'fs';
import path from 'path';

// Load environment variables from ~/.hermes/.env
const envContent = fs.readFileSync(path.join(process.env.HOME, '.hermes/.env'), 'utf8');
const NOSTR_SECKEY = envContent.split('\n').find(line => line.startsWith('NOSTR_SECKEY=')).split('=')[1].trim();

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://relay.snort.social'
];

async function updateProfile() {
    console.log("Updating Nostr profile metadata...");

    const decoded = nip19.decode(NOSTR_SECKEY);
    const sk = decoded.data;

    const metadata = {
        name: "Fractalism",
        display_name: "Fractalism Gatling Gun",
        about: "Sovereign Gnosis Dispatches. Automated truth salvos from the Ground.",
        website: "https://fractalisme.nl",
        picture: "https://fractalisme.nl/the_source.png",
        banner: "https://fractalisme.nl/fractals.jpg"
    };

    const event = finalizeEvent({
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(metadata),
    }, sk);

    let publishedCount = 0;
    for (const url of RELAYS) {
        try {
            const relay = await Relay.connect(url);
            await relay.publish(event);
            console.log(`Profile updated on ${url}`);
            publishedCount++;
            relay.close();
        } catch (e) {
            console.error(`Failed to update on ${url}:`, e.message);
        }
    }
}

updateProfile().catch(err => {
    console.error(err);
    process.exit(1);
});
