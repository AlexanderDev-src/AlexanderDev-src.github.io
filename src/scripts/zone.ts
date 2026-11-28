// Tells the page which section is being read, so the accent colour can drift with it (global.css).
export function startZone() {
	const root = document.documentElement;
	const sections = [...document.querySelectorAll<HTMLElement>('main section')];
	if (!sections.length) return;

	const update = () => {
		const line = window.innerHeight * 0.45;
		let zone = 'hero';
		for (const section of sections) if (section.getBoundingClientRect().top <= line) zone = section.id || 'hero';
		root.dataset.zone = zone;
	};
	window.addEventListener('scroll', update, { passive: true });
	update();
}
