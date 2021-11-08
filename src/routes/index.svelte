<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import { wallet, connect, disconnect } from '$lib/stores/wallet';

	const TWITTER_HANDLE = 'thlcodes';
	const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

	const TEST_GIFS = [
		'https://media.giphy.com/media/dNrzYdQi8mKC4/giphy.gif',
		'https://media.giphy.com/media/QCUkWqHK9nms8/giphy.gif',
		'https://media.giphy.com/media/3o6YfUnEIKXZanEkkE/giphy.gif',
		'https://media.giphy.com/media/ItvzvhvQppInS/giphy.gif'
	];

	onMount(async () => {
		await connect(true);
	});

	onDestroy(async () => {
		await disconnect();
	});

	async function sendGif() {
		if (gifInput.length == 0) {
			console.log('Empty input. Try again.');
			return;
		}
		console.log('Gif link:', gifInput);
	}

	let gifInput: string = '';
	let gifs: string[] = [];

	$: if ($wallet.connected) {
		gifs = [...TEST_GIFS];
	}
</script>

<div class="App">
	<div class={$wallet.connected ? 'authed-container' : 'container'}>
		<div class="header-container">
			<p class="header">👊 Bud Spencer GIF Portal</p>
			<p class="sub-text">View Bud's best!</p>
			{#if !$wallet.connected}
				<button
					class="cta-button connect-wallet-button"
					on:click={async () => await connect(false)}
				>
					Connect to Wallet
				</button>
			{:else}
				<div class="connected-container">
					<input type="text" placeholder="Enter gif link!" bind:value={gifInput} />
					<button class="cta-button submit-gif-button" on:click={async () => await sendGif()}
						>Hit it!</button
					>
					<div class="gif-grid">
						{#each gifs as gif (gif)}
							<div class="gif-item">
								<img src={gif} alt={gif} />
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="footer-container">
			<img alt="Twitter Logo" class="twitter-logo" src="/twitter-logo.svg" />
			<a class="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer"
				>built by @{TWITTER_HANDLE}</a
			>
		</div>
	</div>
</div>

<style>
	.App {
		height: 100vh;
		background-color: #1a202c;
		overflow: scroll;
		text-align: center;
	}

	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 30px 0 30px;
	}

	.authed-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 30px;
	}

	.header {
		margin: 0;
		font-size: 50px;
		font-weight: bold;
		color: white;
	}

	.sub-text {
		font-size: 25px;
		color: white;
	}

	.gradient-text {
		background: -webkit-linear-gradient(left, #60c657 30%, #35aee2 60%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.cta-button {
		height: 45px;
		border: 0;
		width: auto;
		padding-left: 40px;
		padding-right: 40px;
		border-radius: 10px;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;
		color: white;
	}

	.connect-wallet-button {
		background: -webkit-linear-gradient(left, #60c657, #35aee2);
		background-size: 200% 200%;
		animation: gradient-animation 4s ease infinite;
	}

	.submit-gif-button {
		background: -webkit-linear-gradient(left, #4e44ce, #35aee2);
		background-size: 200% 200%;
		animation: gradient-animation 4s ease infinite;
		margin-left: 10px;
	}

	.footer-container {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		width: 100%;
		bottom: 0;
		left: 0;
		padding-bottom: 45px;
	}

	.twitter-logo {
		width: 35px;
		height: 35px;
	}

	.footer-text {
		color: white;
		font-size: 16px;
		font-weight: bold;
	}

	.gif-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		grid-gap: 1.5rem;
		justify-items: center;
		margin: 0;
		padding: 0;
	}

	.gif-grid .gif-item {
		display: flex;
		flex-direction: column;
		position: relative;
		justify-self: center;
		align-self: center;
	}

	.gif-item img {
		width: 100%;
		height: 300px;
		border-radius: 10px;
		object-fit: cover;
	}

	.connected-container input[type='text'] {
		display: inline-block;
		color: white;
		padding: 10px;
		width: 50%;
		height: 60px;
		font-size: 16px;
		box-sizing: border-box;
		background-color: rgba(0, 0, 0, 0.25);
		border: none;
		border-radius: 10px;
		margin: 50px auto;
	}

	.connected-container button {
		height: 50px;
	}
</style>
