<script lang="ts">
	// Constants
	const TWITTER_HANDLE = '_buildspace';
	const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
</script>

<div class="App">
	<div class="container">
		<div class="header-container">
			<p class="header">🖼 GIF Portal</p>
			<p class="sub-text">View your GIF collection in the metaverse ✨</p>
		</div>
		<div class="footer-container">
			<img alt="Twitter Logo" class="twitter-logo" src="/twitter-logo.svg" />
			<a class="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer"
				>{`built on @${TWITTER_HANDLE}`}</a
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
</style>
