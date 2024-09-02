<script lang="ts">
	import { onMount } from "svelte";

	let token: string = "";
	let url_to_fetch: string = "";

	onMount(() => {
		url_to_fetch = import.meta.env.VITE_DEMO_URL || "";
		token = import.meta.env.VITE_DEMO_TOKEN || "";
	});

	let processing_question: boolean = false;
	let content: string = "";

	async function fetchUrlInfo() {
		if (url_to_fetch.trim() === "") {
			content = "Please enter a valid URL";
			return;
		}
		if (processing_question) {
			return;
		}
		console.log("processing question: " + url_to_fetch);
		content = "";
		processing_question = true;
		const formattedQuestion = encodeURIComponent(url_to_fetch);
		const backend_call_url = `/api/fetch-info?url=${formattedQuestion}`;

		try {
			await fetch(backend_call_url, {
				headers: {
					password: token,
				},
			})
				.then(async (response) => {
					if (response.status === 200) {
						let details_obj: any = await response.json();
						content = details_obj.content;
					} else {
						const error_response: any = await response.text();
						content =
							"Unable to search for url due to '" +
							error_response +
							"'";
					}
				})
				.catch((error) => {
					console.error("Error fetching search details:", error);
				})
				.finally(() => {
					processing_question = false;
				});
		} catch (error) {
			console.error("Error fetching search details:", error);
		}
	}
</script>

<svelte:head>
	<title>Web Search Assistant</title>
	<meta name="description" content="Web Search Assistant" />
</svelte:head>

<section>
	<h1>Hello, I am your <nobr>URL fetching Assistant!</nobr></h1>
	<div class="formanddata">
		<form on:submit|preventDefault={fetchUrlInfo}>
			<div class="formsettings">
				<div class="token">
					<input
						class="token"
						type="password"
						bind:value={token}
						placeholder="***"
					/>
				</div>
			</div>
			<input
				class="url_to_fetch"
				type="text"
				bind:value={url_to_fetch}
				placeholder="Enter URL to fetch..."
			/>
			<button
				class="activebutton"
				class:processing={processing_question}
				type="submit"
				>{processing_question
					? "Processing..."
					: "Fetch URL"}</button
			>
		</form>

		<div class="outputsection content">
			{#if processing_question}
				<h2>Content:</h2>
				<p>
					Fetching URL content. Please be patient.
				</p>
			{:else}
				<h2>Content:</h2>
				<p class="contenttext">{content}</p>
			{/if}
		</div>

	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		/* flex: 0.6; */
	}
	div.formanddata {
		width: 100%;
	}
	@media (min-width: 480px) {
		div.formanddata {
			width: 75%;
		}
	}

	form {
		width: 100%;
		margin-top: 10px;
	}
	div.formsettings div.token {
		float: right;
	}
	input.token {
		width: 80px;
	}
	.outputsection {
		width: 100%;
		min-height: 100px;
		margin-top: 10px;
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		margin-bottom: 10px;
		font-size: 14px;
	}
	.outputsection .contenttext {
		font-weight: bold;
		padding-left: 10px;
	}
	input {
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		margin-bottom: 10px;
		font-size: 16px;
	}
	input.url_to_fetch {
		width: 100%;
	}

	button.activebutton {
		width: 180px;
		white-space: nowrap;
		padding: 8px 12px;
		background-color: rgb(134, 162, 217);
		color: #333;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	button.activebutton:hover {
		background-color: #4c7bd9;
	}

	button.activebutton.processing {
		cursor: wait;
		animation: gradientBG 1s infinite alternate;
	}
	@keyframes gradientBG {
		from {
			background-color: #b1c7f1;
		}
		to {
			background-color: #7a9bdb;
		}
	}

	h1 {
		width: 100%;
	}
</style>
