// Elements with [data-tilt] lean towards the mouse in 3D. The value is the most they turn, in degrees.
// The slow ease back when the mouse leaves is the [data-tilt] transition in global.css.
export function startTilt() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	let current: HTMLElement | null = null;

	window.addEventListener('pointermove', (event) => {
		const over = event.pointerType === 'mouse' && event.target instanceof Element ? event.target : null;
		const el = over?.closest<HTMLElement>('[data-tilt]') ?? null;
		if (current && current !== el) {
			current.style.transition = '';
			current.style.transform = '';
		}
		current = el;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) - 0.5;
		const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) - 0.5;
		const max = Number(el.dataset.tilt) || 8;
		el.style.transition = 'transform 0.14s ease-out';
		el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max * 1.2).toFixed(2)}deg) translateZ(8px)`;
	});
}
