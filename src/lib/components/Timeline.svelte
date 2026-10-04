<script lang="ts">
	import * as d3 from 'd3';
	import type { TimelineEvent } from '#lib/types/timeline.js';

	type PixelSelection = [number, number];

	let {
		events,
		start,
		end,
		initial_start,
		initial_end
	}: {
		events: TimelineEvent[];
		start: Date;
		end: Date;
		initial_start?: Date;
		initial_end?: Date;
	} = $props();

	let chart_element: HTMLDivElement;
	let clip_id = `timeline-focus-clip-${crypto.randomUUID()}`;

	$effect(() => {
		const chart_events = events;
		const span_start = start;
		const span_end = end;
		const initial_span_start = initial_start ?? span_start;
		const initial_span_end = initial_end ?? span_end;
		let selected_domain: [Date, Date] = [initial_span_start, initial_span_end];
		let animation_frame: number | undefined;
		let pan_samples: Array<{ time: number; center: number }> = [];
		let edge_bounce_velocity = 0;

		const margin_focus = { top: 20, right: 30, bottom: 30, left: 30 };
		const margin_context = { top: 4, right: 30, bottom: 20, left: 30 };

		function cancel_inertia() {
			if (animation_frame !== undefined) {
				cancelAnimationFrame(animation_frame);
				animation_frame = undefined;
			}
		}

		function render_chart() {
			const chart_width = chart_element.clientWidth;
			const chart_height = chart_element.clientHeight;

			if (chart_width === 0 || chart_height === 0) return;

			const context_height = 72;
			const focus_height = Math.max(0, chart_height - context_height);
			const width = Math.max(0, chart_width - margin_focus.left - margin_focus.right);
			const inner_focus_height = Math.max(0, focus_height - margin_focus.top - margin_focus.bottom);
			const inner_context_height = Math.max(
				0,
				context_height - margin_context.top - margin_context.bottom
			);

			chart_element.replaceChildren();

			const focus_svg = d3
				.select(chart_element)
				.append('svg')
				.attr('width', chart_width)
				.attr('height', focus_height)
				.attr('aria-label', 'Timeline detail view');
			const context_svg = d3
				.select(chart_element)
				.append('svg')
				.attr('width', chart_width)
				.attr('height', context_height)
				.attr(
					'aria-label',
					'Timeline overview. Drag the selection to change the displayed period.'
				);

			focus_svg
				.append('defs')
				.append('clipPath')
				.attr('id', clip_id)
				.append('rect')
				.attr('width', width)
				.attr('height', inner_focus_height);

			const focus_group = focus_svg
				.append('g')
				.attr('transform', `translate(${margin_focus.left},${margin_focus.top})`);
			const context_group = context_svg
				.append('g')
				.attr('transform', `translate(${margin_context.left},${margin_context.top})`);

			const x_context = d3.scaleTime().domain([span_start, span_end]).range([0, width]);
			const x_focus = d3.scaleTime().domain(selected_domain).range([0, width]);
			const focus_axis = d3.axisBottom(x_focus).ticks(8);
			const context_axis = d3.axisBottom(x_context).ticks(6);

			const focus_axis_group = focus_group
				.append('g')
				.attr('transform', `translate(0,${inner_focus_height})`);
			const context_axis_group = context_group
				.append('g')
				.attr('transform', `translate(0,${inner_context_height})`);

			function style_axis(axis_group: d3.Selection<SVGGElement, unknown, null, undefined>) {
				axis_group
					.selectAll<SVGTextElement, unknown>('text')
					.attr('font-size', 11)
					.attr('fill', '#64748b');
				axis_group
					.selectAll<SVGPathElement | SVGLineElement, unknown>('path, line')
					.attr('stroke', '#cbd5e1');
			}

			focus_axis_group.call(focus_axis);
			context_axis_group.call(context_axis);
			style_axis(focus_axis_group);
			style_axis(context_axis_group);

			context_group
				.selectAll<SVGCircleElement, TimelineEvent>('.context-node')
				.data(chart_events, (event) => event.id)
				.join('circle')
				.attr('class', 'context-node')
				.attr('cx', (event) => x_context(event.date))
				.attr('cy', inner_context_height / 2)
				.attr('r', 2)
				.attr('fill', '#94a3b8');

			const focus_content = focus_group.append('g').attr('clip-path', `url(#${clip_id})`);
			const nodes = focus_content
				.selectAll<SVGCircleElement, TimelineEvent>('.event-node')
				.data(chart_events, (event) => event.id)
				.join('circle')
				.attr('class', 'event-node')
				.attr('cx', (event) => x_focus(event.date))
				.attr('cy', (event) => 20 + event.value * Math.max(0, inner_focus_height - 40))
				.attr('r', 5)
				.attr('fill', '#2563eb')
				.attr('fill-opacity', 0.75);

			const brush = d3
				.brushX()
				.extent([
					[0, 0],
					[width, inner_context_height]
				])
				.on('brush end', brushed);
			const brush_group = context_group.append('g').call(brush);

			function constrain_selection(selection: PixelSelection, offset: number): PixelSelection {
				const [x0, x1] = selection;
				const constrained_offset = Math.max(-x0, Math.min(width - x1, offset));
				return [x0 + constrained_offset, x1 + constrained_offset];
			}

			function begin_pan_tracking(selection: PixelSelection) {
				cancel_inertia();
				edge_bounce_velocity = 0;
				pan_samples = [{ time: performance.now(), center: (selection[0] + selection[1]) / 2 }];
			}

			function track_pan(selection: PixelSelection) {
				const time = performance.now();
				const center = (selection[0] + selection[1]) / 2;
				const previous_sample = pan_samples.at(-1);

				if (previous_sample && Math.abs(center - previous_sample.center) > 0.01) {
					const delta = center - previous_sample.center;
					const duration = time - previous_sample.time;

					if (duration > 0 && (selection[0] <= 0 || selection[1] >= width)) {
						const moving_outward =
							(selection[0] <= 0 && delta < 0) || (selection[1] >= width && delta > 0);

						if (moving_outward) {
							const bounce_speed = Math.max(
								0.12,
								Math.min(0.55, (Math.abs(delta) / duration) * 0.28)
							);
							edge_bounce_velocity = selection[0] <= 0 ? bounce_speed : -bounce_speed;
						}
					}

					pan_samples.push({ time, center });
				}

				pan_samples = pan_samples.filter((sample) => time - sample.time <= 120);
			}

			function brush_selection(): PixelSelection | null {
				const brush_node = brush_group.node();
				return brush_node === null
					? null
					: (d3.brushSelection(brush_node) as PixelSelection | null);
			}

			function start_inertia(selection: PixelSelection) {
				let velocity = edge_bounce_velocity;

				if (Math.abs(velocity) < 0.02 && pan_samples.length >= 2) {
					const first_sample = pan_samples[0];
					const last_sample = pan_samples.at(-1);

					if (last_sample) {
						velocity =
							(last_sample.center - first_sample.center) / (last_sample.time - first_sample.time);
					}
				}

				if (!Number.isFinite(velocity) || Math.abs(velocity) < 0.02) return;

				velocity = Math.max(-1.5, Math.min(1.5, velocity));
				let current_selection = selection;
				let previous_time = performance.now();

				function continue_inertia(time: number) {
					const elapsed = Math.min(time - previous_time, 50);
					previous_time = time;
					const requested_offset = velocity * elapsed;
					const next_selection = constrain_selection(current_selection, requested_offset);
					const moved = next_selection[0] - current_selection[0];
					const hit_boundary = Math.abs(moved - requested_offset) > 0.01;

					if (hit_boundary) velocity *= -0.28;

					if (Math.abs(moved) < 0.01 && !hit_boundary) {
						animation_frame = undefined;
						return;
					}

					current_selection = next_selection;
					brush_group.call(brush.move, current_selection);
					velocity *= Math.pow(0.92, elapsed / 16.67);

					if (Math.abs(velocity) >= 0.02) {
						animation_frame = requestAnimationFrame(continue_inertia);
					} else {
						animation_frame = undefined;
					}
				}

				animation_frame = requestAnimationFrame(continue_inertia);
			}

			brush
				.on('start.inertia', (event: d3.D3BrushEvent<unknown>) => {
					if (event.selection && event.mode === 'drag' && event.sourceEvent) {
						begin_pan_tracking(event.selection as PixelSelection);
					}
				})
				.on('brush.inertia', (event: d3.D3BrushEvent<unknown>) => {
					if (event.selection && event.mode === 'drag' && event.sourceEvent) {
						track_pan(event.selection as PixelSelection);
					}
				})
				.on('end.inertia', (event: d3.D3BrushEvent<unknown>) => {
					if (event.selection && event.mode === 'drag' && event.sourceEvent) {
						start_inertia(event.selection as PixelSelection);
					}
				});

			focus_group.attr('cursor', 'grab').call(
				d3
					.drag<SVGGElement, unknown>()
					.filter(
						(event) => !(event.target instanceof Element && event.target.closest('.focus-axis'))
					)
					.on('start', () => {
						const selection = brush_selection();
						if (selection) begin_pan_tracking(selection);
					})
					.on('drag', (event) => {
						const selection = brush_selection();
						if (!selection) return;

						const next_selection = constrain_selection(selection, event.dx);
						brush_group.call(brush.move, next_selection);
						track_pan(next_selection);
					})
					.on('end', () => {
						const selection = brush_selection();
						if (selection) start_inertia(selection);
					})
			);

			function brushed(event: d3.D3BrushEvent<unknown>) {
				if (event.selection === null) {
					selected_domain = [span_start, span_end];
				} else {
					const [x0, x1] = event.selection as PixelSelection;
					selected_domain = [x_context.invert(x0), x_context.invert(x1)];
				}

				x_focus.domain(selected_domain);
				focus_axis_group.call(focus_axis);
				style_axis(focus_axis_group);
				nodes.attr('cx', (timeline_event) => x_focus(timeline_event.date));
			}

			const initial_selection: PixelSelection = [
				x_context(selected_domain[0]),
				x_context(selected_domain[1])
			];
			brush_group.call(brush.move, initial_selection);
		}

		render_chart();
		const resize_observer = new ResizeObserver(render_chart);
		resize_observer.observe(chart_element);

		return () => {
			cancel_inertia();
			resize_observer.disconnect();
			chart_element.replaceChildren();
		};
	});
</script>

<div class="timeline" bind:this={chart_element}></div>

<style>
	.timeline {
		display: flex;
		flex-direction: column;
		min-height: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #fff;
	}

	:global(.timeline svg) {
		display: block;
	}

	:global(.timeline .selection) {
		fill: #3b82f6;
		fill-opacity: 0.2;
		stroke: #dc2626;
		stroke-width: 2px;
	}

	:global(.timeline .handle) {
		fill: #dc2626;
	}

	:global(.timeline .event-node:hover) {
		fill: #1d4ed8;
		fill-opacity: 1;
	}
</style>
