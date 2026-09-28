import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// In-page links (header, hero, footer) fly to their section instead of the browser's plain
// smooth scroll: the page eases out and back in, the stars streak past (cosmos.ts listens for
// `jump:start` / `jump:end`), and the section's [data-arrive] parts rise into place as it lands.
// With reduced motion the browser's own jump is left alone.
export function startJumps() {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
	const root = document.documentElement;
	let stopCurrent: (() => void) | null = null;

	document.addEventListener('click', (event) => {
		if (reduce.matches || event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]:not(.skip-link)');
		const target = link?.hash ? document.getElementById(link.hash.slice(1)) : null;
		if (!link || !target) return;

		event.preventDefault();
		stopCurrent?.();
		stopCurrent = jump(target, link.hash);
	});

	function jump(target: HTMLElement, hash: string) {
		const header = document.querySelector<HTMLElement>('.header');
		const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0);
		const y = gsap.utils.clamp(0, root.scrollHeight - window.innerHeight, top);
		// Longer trips take a little longer, but never drag.
		const duration = gsap.utils.clamp(0.7, 1.5, 0.5 + Math.abs(y - window.scrollY) / 3000);

		const parts = [...target.querySelectorAll<HTMLElement>('[data-arrive]')].filter(
			(part) => part.closest('section') === target,
		);
		const labels = parts.filter((part) => part.dataset.arrive === 'label');
		const titles = parts.filter((part) => part.dataset.arrive === 'title');

		// Start from a clean state in case an earlier jump left these half revealed.
		gsap.killTweensOf(parts);
		gsap.set(parts, { clearProps: 'opacity,transform,clipPath,letterSpacing' });
		const spacing = labels.map((label) => getComputedStyle(label).letterSpacing);

		// Labels slide in from the left and tighten up. Titles rise out of a mask at their baseline.
		gsap.set(labels, { opacity: 0, x: -16, letterSpacing: '0.3em' });
		gsap.set(titles, { yPercent: 100, clipPath: 'inset(-10% -5% 100% -5%)' });

		let arrived = false;
		const arrive = () => {
			if (arrived) return;
			arrived = true;
			gsap.to(labels, {
				opacity: 1,
				x: 0,
				letterSpacing: (i: number) => spacing[i],
				duration: 0.7,
				ease: 'power3.out',
				clearProps: 'opacity,transform,letterSpacing',
			});
			gsap.to(titles, {
				yPercent: 0,
				clipPath: 'inset(-10% -5% -20% -5%)',
				duration: 0.9,
				delay: 0.08,
				stagger: 0.08,
				ease: 'expo.out',
				clearProps: 'transform,clipPath',
			});
		};

		let done = false;
		const finish = (landed: boolean) => {
			if (done) return;
			done = true;
			arrive();
			root.style.scrollBehavior = '';
			window.dispatchEvent(new CustomEvent('jump:end'));
			if (!landed) return;

			if (location.hash !== hash) history.pushState(null, '', hash);
			// Move focus too, so the next Tab continues from the section, like a normal anchor jump.
			if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
			target.focus({ preventScroll: true });
		};

		// The CSS smooth scroll would fight every step of the tween.
		root.style.scrollBehavior = 'auto';
		window.dispatchEvent(new CustomEvent('jump:start', { detail: hash }));

		const tween = gsap.to(window, {
			duration,
			ease: 'power3.inOut',
			// Scrolling by hand mid-flight hands control back to the reader.
			scrollTo: { y, autoKill: true, onAutoKill: () => finish(false) },
			// Start the reveal a moment before landing so the two blend together.
			onUpdate: () => {
				if (tween.progress() > 0.7) arrive();
			},
			onComplete: () => finish(true),
		});

		return () => {
			tween.kill();
			finish(false);
		};
	}
}
