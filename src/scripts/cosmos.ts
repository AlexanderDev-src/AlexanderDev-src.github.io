// Space background (stars, nebula, shooting stars) and the hero black hole.
// Both canvases share one requestAnimationFrame loop.
import { cosmos, darkIcons, deviconUrl } from '../data/site';

interface Star {
	x: number;
	y: number;
	z: number;
	r: number;
	a: number;
	tw: number;
	ts: number;
	c: string;
}

interface Particle {
	r: number;
	a: number;
	v: number;
	s: number;
	t: number;
	j: number;
}

interface Icon {
	label: string;
	bitmap: HTMLCanvasElement | null;
}

interface Orb {
	icon: Icon;
	a: number;
	r: number;
	tilt: number;
	rot: number;
	spin: number;
}

interface Shoot {
	x: number;
	y: number;
	t: number;
	ang: number;
}

const TAU = Math.PI * 2;
const ICON_PX = 96;

// Rasterise each logo once so the loop draws a bitmap, not an SVG. Black logos become white.
function loadIcons(onLoad: () => void): Icon[] {
	return cosmos.orbitIcons.map(([id, label]) => {
		const icon: Icon = { label, bitmap: null };
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				const c = document.createElement('canvas');
				c.width = c.height = ICON_PX;
				const x = c.getContext('2d')!;
				x.drawImage(img, 0, 0, ICON_PX, ICON_PX);
				if (darkIcons.includes(id)) {
					x.globalCompositeOperation = 'source-in';
					x.fillStyle = '#fff';
					x.fillRect(0, 0, ICON_PX, ICON_PX);
				}
				icon.bitmap = c;
				onLoad();
			} catch {
				// Keep the text label fallback.
			}
		};
		img.src = deviconUrl(id);
		return icon;
	});
}

export function startCosmos() {
	const space = document.getElementById('space') as HTMLCanvasElement | null;
	const sx = space?.getContext('2d');
	if (!space || !sx) return;
	const hole = document.getElementById('blackhole') as HTMLCanvasElement | null;
	const hx = hole?.getContext('2d') ?? null;

	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

	let dpr = 1;
	let w = 0;
	let h = 0;
	let hw = 0;
	let hh = 0;
	let R = 0;
	let stars: Star[] = [];
	let nebula: HTMLCanvasElement | null = null;
	let disk: Particle[] = [];
	let orbs: Orb[] = [];
	let shoot: Shoot | null = null;
	let nextShoot = 2;
	let holeVisible = true;
	// Warp: while an in-page jump runs (scripts/jump.ts), stars stretch into streaks with the scroll speed.
	let warping = false;
	let warp = 0;
	let speed = 0;
	let lastScroll = 0;

	const renderStill = () => {
		if (still) draw(0, 0);
	};
	const icons = cosmos.showOrbitIcons ? loadIcons(renderStill) : [];

	function makeStars() {
		const n = Math.round(((w * h) / 2600) * (cosmos.starDensity / 60));
		stars = Array.from({ length: n }, () => {
			const z = Math.random() ** 2;
			const hue = [60, 220, 300, 0][Math.floor(Math.random() * 4)];
			return {
				x: Math.random(),
				y: Math.random(),
				z,
				r: 0.35 + z * 1.5,
				a: 0.3 + z * 0.7,
				tw: Math.random() * TAU,
				ts: 0.5 + Math.random() * 2,
				c: Math.random() < 0.2 ? `oklch(0.9 0.08 ${hue})` : '#fff',
			};
		});
	}

	// Pre-rendered once per resize at quarter resolution, 1.6x viewport height.
	function makeNebula() {
		const W = Math.ceil(w / 4);
		const H = Math.ceil((h * 1.6) / 4);
		const c = document.createElement('canvas');
		c.width = W;
		c.height = H;
		const x = c.getContext('2d')!;
		x.globalCompositeOperation = 'lighter';
		let seed = 7;
		const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		const clouds = [
			{ cx: 0.78, cy: 0.18, hue: 285, s: 0.55 },
			{ cx: 0.2, cy: 0.42, hue: 255, s: 0.6 },
			{ cx: 0.85, cy: 0.62, hue: 215, s: 0.45 },
			{ cx: 0.3, cy: 0.85, hue: 270, s: 0.5 },
		];
		for (const cl of clouds) {
			for (let i = 0; i < 28; i++) {
				const px = (cl.cx + (rnd() - 0.5) * cl.s) * W;
				const py = (cl.cy + (rnd() - 0.5) * cl.s * 0.6) * H;
				const rad = (0.04 + rnd() * 0.16) * Math.max(W, H);
				const g = x.createRadialGradient(px, py, 0, px, py, rad);
				g.addColorStop(0, `oklch(0.45 0.1 ${cl.hue + (rnd() - 0.5) * 20} / ${0.03 + rnd() * 0.05})`);
				g.addColorStop(1, `oklch(0.25 0.06 ${cl.hue} / 0)`);
				x.fillStyle = g;
				x.fillRect(0, 0, W, H);
			}
		}
		nebula = c;
	}

	function makeDisk() {
		R = Math.min(hw, hh) * 0.11;
		orbs = icons.map((icon, i) => ({
			icon,
			a: Math.random() * TAU,
			r: R * (1.3 + (i / icons.length) * 3.1),
			tilt: 0.28 + Math.random() * 0.3,
			rot: -0.35 + Math.random() * 0.5,
			spin: Math.random() * TAU,
		}));
		disk = Array.from({ length: 1100 }, () => {
			const t = Math.random() ** 1.6;
			const r = R * (1.55 + t * 2.4);
			return {
				r,
				a: Math.random() * TAU,
				v: 0.9 * (R / r) ** 1.5,
				s: 0.5 + Math.random() * 1.4,
				t,
				j: (Math.random() - 0.5) * R * 0.08,
			};
		});
	}

	function resizeSpace() {
		dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		w = window.innerWidth;
		h = window.innerHeight;
		space!.width = w * dpr;
		space!.height = h * dpr;
		makeStars();
		makeNebula();
	}

	function resizeHole() {
		if (!hole) return;
		const rect = hole.getBoundingClientRect();
		hw = rect.width;
		hh = rect.height;
		hole.width = hw * dpr;
		hole.height = hh * dpr;
		makeDisk();
	}

	// Icons spiral inward, speeding up near the horizon, then respawn on the outer edge.
	function drawOrbs(x: CanvasRenderingContext2D, cx: number, cy: number, front: boolean, dt: number) {
		const outer = R * 4.4;
		for (const o of orbs) {
			if (!front) {
				const k = R / o.r;
				o.a += dt * 0.55 * k ** 1.3;
				o.r -= dt * R * (0.09 + 0.5 * k * k);
				o.spin += dt * (0.4 + 2.5 * k * k);
				if (o.r < R * 1.02) {
					o.r = outer;
					o.a = Math.random() * TAU;
					o.tilt = 0.28 + Math.random() * 0.3;
					o.rot = -0.35 + Math.random() * 0.5;
				}
			}
			const sa = Math.sin(o.a);
			if (sa > 0 !== front) continue;
			const ex = Math.cos(o.a) * o.r;
			const ey = sa * o.r * o.tilt;
			const cr = Math.cos(o.rot);
			const sr = Math.sin(o.rot);
			const px = cx + ex * cr - ey * sr;
			const py = cy + ex * sr + ey * cr;
			const near = Math.min(1, Math.max(0, (o.r - R * 1.05) / (R * 1.2)));
			const born = Math.min(1, (outer - o.r) / (R * 0.4));
			const size = R * 0.42 * (0.35 + 0.65 * near) * (0.85 + 0.15 * sa * (front ? 1 : -1));
			x.save();
			x.globalAlpha = Math.max(0, near * born) * (front ? 1 : 0.75);
			x.translate(px, py);
			x.rotate(Math.sin(o.spin) * 0.3 + (1 - near) * o.spin);
			x.scale(1, 1 - (1 - near) * 0.5);
			x.fillStyle = 'oklch(0.12 0.02 285 / 0.85)';
			x.strokeStyle = 'oklch(1 0 0 / 0.18)';
			x.lineWidth = 1;
			x.beginPath();
			x.arc(0, 0, size * 0.72, 0, TAU);
			x.fill();
			x.stroke();
			if (o.icon.bitmap) {
				x.drawImage(o.icon.bitmap, -size / 2, -size / 2, size, size);
			} else {
				x.fillStyle = '#fff';
				x.font = `700 ${size * 0.38}px 'Syne', sans-serif`;
				x.textAlign = 'center';
				x.textBaseline = 'middle';
				x.fillText(o.icon.label, 0, 0);
			}
			x.restore();
		}
	}

	function drawHole(x: CanvasRenderingContext2D, sec: number, dt: number) {
		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		x.clearRect(0, 0, hw, hh);
		if (!cosmos.showBlackHole) return;
		const cx = hw / 2 + mouse.x * 14;
		const cy = hh / 2 + mouse.y * 14;
		const tilt = 0.2 + mouse.y * 0.06;
		const rot = -0.22 + mouse.x * 0.08;
		const cr = Math.cos(rot);
		const sr = Math.sin(rot);

		const halo = x.createRadialGradient(cx, cy, R, cx, cy, R * 5);
		halo.addColorStop(0, 'oklch(0.6 0.2 320 / 0.35)');
		halo.addColorStop(0.4, 'oklch(0.45 0.18 290 / 0.12)');
		halo.addColorStop(1, 'oklch(0.3 0.1 285 / 0)');
		x.fillStyle = halo;
		x.fillRect(0, 0, hw, hh);

		// Accretion disk, split into the half behind the hole and the half in front.
		const particles = (front: boolean) => {
			x.globalCompositeOperation = 'lighter';
			for (const p of disk) {
				const a = p.a + sec * p.v;
				const sa = Math.sin(a);
				if (sa > 0 !== front) continue;
				const ex = Math.cos(a) * p.r;
				const ey = sa * (p.r * tilt) + p.j;
				const px = cx + ex * cr - ey * sr;
				const py = cy + ex * sr + ey * cr;
				const boost = 0.6 + 0.4 * Math.cos(a);
				x.globalAlpha = (1 - p.t * 0.75) * boost * 0.85;
				x.fillStyle = p.t < 0.25 ? 'oklch(0.95 0.06 70)' : p.t < 0.55 ? 'oklch(0.82 0.14 50)' : 'oklch(0.7 0.18 330)';
				x.fillRect(px, py, p.s, p.s);
			}
			x.globalAlpha = 1;
			x.globalCompositeOperation = 'source-over';
		};

		particles(false);
		drawOrbs(x, cx, cy, false, dt);

		x.save();
		x.translate(cx, cy);
		const lens = x.createRadialGradient(0, 0, R, 0, 0, R * 1.9);
		lens.addColorStop(0, 'oklch(0.95 0.08 70 / 0.95)');
		lens.addColorStop(0.12, 'oklch(0.85 0.14 55 / 0.6)');
		lens.addColorStop(0.45, 'oklch(0.65 0.2 330 / 0.18)');
		lens.addColorStop(1, 'oklch(0.4 0.15 300 / 0)');
		x.fillStyle = lens;
		x.beginPath();
		x.arc(0, 0, R * 1.9, 0, TAU);
		x.fill();
		x.fillStyle = 'oklch(0.03 0.005 285)';
		x.beginPath();
		x.arc(0, 0, R, 0, TAU);
		x.fill();
		x.strokeStyle = 'oklch(0.97 0.05 75 / 0.9)';
		x.lineWidth = 1.2;
		x.beginPath();
		x.arc(0, 0, R * 1.03, 0, TAU);
		x.stroke();
		x.restore();

		particles(true);
		drawOrbs(x, cx, cy, true, dt);
	}

	function draw(sec: number, dt: number) {
		const x = sx!;
		// Smooth the mouse (lerp 0.04 per 60fps frame).
		const ease = 1 - (1 - 0.04) ** (dt * 60);
		mouse.x += (mouse.tx - mouse.x) * ease;
		mouse.y += (mouse.ty - mouse.y) * ease;
		const scroll = still ? 0 : window.scrollY;
		if (dt > 0) {
			speed += ((scroll - lastScroll) / dt - speed) * (1 - Math.exp(-dt * 15));
			warp += ((warping ? 1 : 0) - warp) * (1 - Math.exp(-dt * 6));
		}
		lastScroll = scroll;

		x.setTransform(dpr, 0, 0, dpr, 0, 0);
		x.fillStyle = 'oklch(0.08 0.015 285)';
		x.fillRect(0, 0, w, h);

		const neb = cosmos.nebulaIntensity / 60;
		if (nebula && neb > 0) {
			const oy = -((scroll * 0.06) % (h * 0.6));
			x.globalAlpha = Math.min(1, neb);
			x.drawImage(nebula, mouse.x * -20, oy + mouse.y * -20, w, h * 1.6);
			if (neb > 1) {
				x.globalAlpha = neb - 1;
				x.drawImage(nebula, mouse.x * -20, oy + mouse.y * -20, w, h * 1.6);
			}
			x.globalAlpha = 1;
		}

		for (const s of stars) {
			const px = (((s.x * w - mouse.x * s.z * 40) % w) + w) % w;
			const py = (((s.y * h - scroll * s.z * 0.25 - mouse.y * s.z * 40) % h) + h) % h;
			x.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(sec * s.ts + s.tw));
			x.fillStyle = s.c;
			// The trail is where the star was ~90ms ago, so it points against the scroll.
			const trail = Math.max(-260, Math.min(260, warp * speed * s.z * 0.25 * 0.09));
			if (Math.abs(trail) > 2) {
				x.strokeStyle = s.c;
				x.lineWidth = Math.max(0.8, s.r * 1.4);
				x.lineCap = 'round';
				x.beginPath();
				x.moveTo(px, py);
				x.lineTo(px, py + trail);
				x.stroke();
			} else if (s.r > 1.3) {
				x.beginPath();
				x.arc(px, py, s.r, 0, TAU);
				x.fill();
			} else {
				x.fillRect(px, py, s.r * 1.4, s.r * 1.4);
			}
		}
		x.globalAlpha = 1;

		if (!still) {
			if (sec > nextShoot && !shoot) {
				shoot = { x: Math.random() * w * 0.8 + w * 0.1, y: Math.random() * h * 0.4, t: 0, ang: 0.35 + Math.random() * 0.4 };
			}
			if (shoot) {
				shoot.t += dt;
				const d = shoot.t * 900;
				const len = 140;
				const hx0 = shoot.x + Math.cos(shoot.ang) * d;
				const hy0 = shoot.y + Math.sin(shoot.ang) * d;
				const tx = hx0 - Math.cos(shoot.ang) * len;
				const ty = hy0 - Math.sin(shoot.ang) * len;
				const fade = Math.max(0, 1 - shoot.t / 0.9);
				const g = x.createLinearGradient(hx0, hy0, tx, ty);
				g.addColorStop(0, `rgba(255,245,230,${0.9 * fade})`);
				g.addColorStop(1, 'rgba(255,245,230,0)');
				x.strokeStyle = g;
				x.lineWidth = 1.4;
				x.beginPath();
				x.moveTo(hx0, hy0);
				x.lineTo(tx, ty);
				x.stroke();
				if (shoot.t > 0.9) {
					shoot = null;
					nextShoot = sec + 4 + Math.random() * 6;
				}
			}
		}

		if (hx && holeVisible) drawHole(hx, sec, dt);
	}

	resizeSpace();
	resizeHole();

	// The hole canvas has its own ResizeObserver below.
	window.addEventListener('resize', () => {
		resizeSpace();
		renderStill();
	});

	if (hole) {
		new ResizeObserver(() => {
			resizeHole();
			renderStill();
		}).observe(hole);
		new IntersectionObserver(([entry]) => {
			holeVisible = entry.isIntersecting;
			renderStill();
		}).observe(hole);
	}

	// Reduced motion: one static frame, no parallax, no spiral.
	if (still) {
		renderStill();
		return;
	}

	lastScroll = window.scrollY;
	window.addEventListener('jump:start', () => (warping = true));
	window.addEventListener('jump:end', () => (warping = false));

	window.addEventListener('pointermove', (e) => {
		mouse.tx = e.clientX / window.innerWidth - 0.5;
		mouse.ty = e.clientY / window.innerHeight - 0.5;
	});

	let last: number | null = null;
	const loop = (t: number) => {
		const sec = t / 1000;
		const dt = last === null ? 0 : Math.min(0.05, sec - last);
		last = sec;
		draw(sec, dt);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}
