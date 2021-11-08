import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { browser } from '$app/env';

interface Solana {
	isPhantom?: boolean;
	isConnected?: boolean;
	connect(opts?: any): Promise<{ publicKey: any }>;
	disconnect(): Promise<void>;
}

interface Wallet {
	/** true, if a wallet is connected */
	connected: boolean;

	/** public key of the connected wallet */
	pubKey?: string;

	/** errorß */
	error?: Error;
}

const store = writable<Wallet>({
	connected: false
});

const solana: Solana = globalThis?.solana;

export async function connect(silent: boolean): Promise<boolean> {
	if (!browser) {
		return;
	}
	try {
		console.log('trying to connect to solana wallet with', { silent });
		const { publicKey } = await solana.connect({ onlyIfTrusted: silent });
		store.update((w) => {
			w.connected = true;
			w.pubKey = publicKey.toString();
			return w;
		});
	} catch (e) {
		console.error('could not connect to solana wallet', e);
		store.update((w) => {
			w.connected = false;
			w.error = e;
			return w;
		});
	}
	return;
}

export async function disconnect(): Promise<void> {
	await solana?.disconnect();
}

export const wallet = store as Readable<Wallet>;
