<script>
	// import Header from './Header.svelte';
	import './styles.css';
</script>

<div class="app">
	  <!-- <Header /> -->
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Reminder Assistant</title>
	<script src="https://accounts.google.com/gsi/client"></script>

	<main>
		<slot />
	</main>

	<!-- <footer>
		<p>Just a demo</p>
	</footer> -->
</div>

<style>

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	/* footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	} */
</style>
