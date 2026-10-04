<script lang="ts">
	import Timeline from '#lib/components/Timeline.svelte';
	import type { TimelineEvent } from '#lib/types/timeline.js';

	const start = new Date('2020-01-01T00:00:00');
	const end = new Date('2025-12-31T00:00:00');
	const events: TimelineEvent[] = Array.from({ length: 80 }, (_, index) => ({
		id: `event-${index}`,
		date: new Date(start.getTime() + ((index * 947 + 431) % 2_190) * 86_400_000),
		value: ((index * 37 + 11) % 100) / 100,
		label: `Event ${index + 1}`
	}));
</script>

<svelte:head>
	<title>D3 Timeline</title>
	<meta
		name="description"
		content="A responsive D3 timeline with a brushable overview and detail view."
	/>
</svelte:head>

<main>
	<section class="timeline-panel" aria-labelledby="timeline-title">
		<header>
			<h1 id="timeline-title">Timeline</h1>
			<p>Drag the overview selection or the detail view to navigate through the events.</p>
		</header>
		<div class="timeline-chart">
			<Timeline
				{events}
				{start}
				{end}
				initial_start={new Date('2022-01-01')}
				initial_end={new Date('2024-01-01')}
			/>
		</div>
	</section>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html),
	:global(body) {
		margin: 0;
		min-width: 320px;
		min-height: 100%;
		background: #f8fafc;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	main {
		display: grid;
		min-height: 100vh;
		padding: clamp(1rem, 3vw, 3rem);
	}

	.timeline-panel {
		display: grid;
		grid-template-rows: auto minmax(20rem, 1fr);
		gap: 1rem;
		min-height: 0;
		width: min(100%, 90rem);
		margin: auto;
		overflow: hidden;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		background: #fff;
		box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
	}

	header {
		padding: 1.25rem 1.5rem 0;
	}

	h1,
	p {
		margin: 0;
	}

	h1 {
		color: #0f172a;
		font-size: clamp(1.5rem, 3vw, 2rem);
	}

	p {
		margin-top: 0.35rem;
		color: #475569;
	}

	.timeline-chart {
		min-height: 20rem;
		height: min(60vh, 42rem);
	}
</style>
