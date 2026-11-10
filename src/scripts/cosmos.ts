// Space background in 3D (three.js), on the one fixed #space canvas: stars, nebula, the black hole
// with its disk and tech icons, a ringed planet, and a far galaxy. Scrolling flies the camera
// from the hole, past the planet, to the galaxy.
import {
	AdditiveBlending,
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	CatmullRomCurve3,
	Color,
	ColorManagement,
	DirectionalLight,
	Group,
	LinearSRGBColorSpace,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	SphereGeometry,
	Sprite,
	SpriteMaterial,
	Vector3,
	WebGLRenderer,
	type Texture,
} from 'three';
import { cosmos, darkIcons, iconUrl } from '../data/site';

const TAU = Math.PI * 2;
// World units. R is the event horizon; icons respawn at OUTER.
const R = 2.4;
const OUTER = R * 4.6;
const HALF_FOV = (22.5 * Math.PI) / 180;
const PLANET = new Vector3(-72, -2, -46);
const GALAXY = new Vector3(-110, 40, -260);
const ORIGIN = new Vector3();

// "Moonlit" colours: cool blue nebula and glow, and a disk that cools from cream to deep blue.
const NEBULA = [0x2a3f78, 0x3a5fb0, 0x556a8c, 0x1f4a6a, 0x6a7fa8];
const GLOW = 0x4a6fb8;
const DISK = [new Color(1, 0.95, 0.82), new Color(1, 0.6, 0.25), new Color(0.7, 0.75, 0.9), new Color(0.15, 0.22, 0.45)];

// Where the black hole is on screen, in CSS pixels. `r` is 0 until the scene has drawn.
// The welcome page reads it to aim its fall (Welcome.astro).
export const hole = { x: 0, y: 0, r: 0 };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
	const t = clamp((v - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};
const sign = () => (Math.random() < 0.5 ? -1 : 1);

// A round gradient, used as the sprite for every point and glow.
function glowTexture(stops: [number, string][], size: number) {
	const c = document.createElement('canvas');
	c.width = c.height = size;
	const x = c.getContext('2d')!;
	const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	for (const [at, color] of stops) g.addColorStop(at, color);
	x.fillStyle = g;
	x.fillRect(0, 0, size, size);
	return new CanvasTexture(c);
}

function glowSprite(map: Texture, color: number, scale: number, opacity: number) {
	const sprite = new Sprite(
		new SpriteMaterial({ map, color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false }),
	);
	sprite.scale.set(scale, scale, 1);
	return sprite;
}

export function startCosmos() {
	const canvas = document.getElementById('space') as HTMLCanvasElement | null;
	if (!canvas) return;
	// The empty box in the page that the black hole should sit in (Hero.astro, Welcome.astro).
	const slot = document.getElementById('blackhole');
	const dim = document.getElementById('dim');

	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
	} catch {
		// No WebGL: the page keeps its plain dark background.
		return;
	}
	// The colours here are tuned by eye as plain numbers, so three.js must not convert them.
	ColorManagement.enabled = false;
	renderer.outputColorSpace = LinearSRGBColorSpace;
	renderer.setClearColor(0x070a12, 1);

	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
	const scene = new Scene();
	const camera = new PerspectiveCamera(45, 1, 0.1, 6000);
	const target = new Vector3();
	const dot = glowTexture(
		[
			[0, 'rgba(255,255,255,1)'],
			[0.22, 'rgba(255,255,255,0.8)'],
			[0.55, 'rgba(255,255,255,0.18)'],
			[1, 'rgba(255,255,255,0)'],
		],
		64,
	);
	const soft = glowTexture(
		[
			[0, 'rgba(255,255,255,0.9)'],
			[0.35, 'rgba(255,255,255,0.35)'],
			[0.7, 'rgba(255,255,255,0.08)'],
			[1, 'rgba(255,255,255,0)'],
		],
		256,
	);

	const points = (pos: number[], col: number[], size: number, opacity: number, attenuate = true) => {
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
		geometry.setAttribute('color', new BufferAttribute(new Float32Array(col), 3));
		const cloud = new Points(
			geometry,
			new PointsMaterial({
				size,
				map: dot,
				vertexColors: true,
				transparent: true,
				opacity,
				blending: AdditiveBlending,
				depthWrite: false,
				sizeAttenuation: attenuate,
			}),
		);
		cloud.frustumCulled = false;
		return cloud;
	};

	const renderStill = () => {
		if (still) frame(0, 0);
	};

	// Sky: stars and nebula on a huge shell that follows the camera, so they never get closer.
	const sky = new Group();
	scene.add(sky);
	const density = cosmos.starDensity / 60;
	const tints = [
		[1, 1, 1],
		[1, 1, 1],
		[1, 0.9, 0.75],
		[0.75, 0.85, 1],
		[1, 0.8, 0.6],
		[0.85, 0.92, 1],
	];
	const starShell = (count: number, size: number, opacity: number) => {
		const pos: number[] = [];
		const col: number[] = [];
		for (let i = 0; i < count; i++) {
			const u = Math.random() * 2 - 1;
			const a = Math.random() * TAU;
			const s = Math.sqrt(1 - u * u);
			const r = 700 + Math.random() * 1100;
			pos.push(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r);
			const t = tints[Math.floor(Math.random() * tints.length)];
			const b = 0.35 + Math.random() * 0.65;
			col.push(t[0] * b, t[1] * b, t[2] * b);
		}
		sky.add(points(pos, col, size, opacity, false));
	};
	starShell(Math.round(7000 * density), 2.4, 0.95);
	starShell(Math.round(700 * density), 5.5, 1);

	const nebula: { sprite: Sprite; opacity: number }[] = [];
	for (let i = 0; i < 26; i++) {
		const u = Math.random() * 1.4 - 0.7;
		const a = Math.random() * TAU;
		const s = Math.sqrt(1 - u * u);
		const sprite = glowSprite(soft, NEBULA[i % NEBULA.length], 500 + Math.random() * 700, 0);
		sprite.position.set(Math.cos(a) * s * 900, u * 900, Math.sin(a) * s * 900);
		sky.add(sprite);
		nebula.push({ sprite, opacity: (0.05 + Math.random() * 0.09) * (cosmos.nebulaIntensity / 60) });
	}

	// Dust along the flight path, so the camera's movement can be felt.
	{
		const pos: number[] = [];
		const col: number[] = [];
		for (let i = 0; i < 2600; i++) {
			pos.push(-130 + Math.random() * 170, -40 + Math.random() * 100, -140 + Math.random() * 200);
			const b = 0.25 + Math.random() * 0.45;
			col.push(b * 0.8, b * 0.85, b);
		}
		scene.add(points(pos, col, 2.6, 0.8, false));
	}

	// Black hole. The disk is split into bands, and the bands nearer the hole turn faster.
	const holeGroup = new Group();
	holeGroup.rotation.set(0.24, 0, -0.2);
	holeGroup.visible = cosmos.showBlackHole;
	scene.add(holeGroup);
	holeGroup.add(new Mesh(new SphereGeometry(R, 48, 32), new MeshBasicMaterial({ color: 0x000000 })));

	const bands: { cloud: Points; speed: number; mid: number }[] = [];
	{
		const inner = R * 1.5;
		const outer = R * 4.3;
		const count = 7;
		const color = new Color();
		for (let b = 0; b < count; b++) {
			const a0 = inner + (outer - inner) * (b / count) ** 1.25;
			const a1 = inner + (outer - inner) * ((b + 1) / count) ** 1.25;
			const pos: number[] = [];
			const col: number[] = [];
			for (let i = 0, n = Math.round(5600 * (1 - (b / count) * 0.45)); i < n; i++) {
				const r = a0 + Math.random() * (a1 - a0);
				const a = Math.random() * TAU;
				const t = (r - inner) / (outer - inner);
				pos.push(Math.cos(a) * r, (Math.random() + Math.random() + Math.random() - 1.5) * 0.05 * r, Math.sin(a) * r);
				if (t < 0.2) color.copy(DISK[0]).lerp(DISK[1], t / 0.2);
				else if (t < 0.6) color.copy(DISK[1]).lerp(DISK[2], (t - 0.2) / 0.4);
				else color.copy(DISK[2]).lerp(DISK[3], (t - 0.6) / 0.4);
				const k = (0.35 + Math.random() * 0.65) * (1 - t * 0.55);
				col.push(color.r * k, color.g * k, color.b * k);
			}
			const cloud = points(pos, col, 0.24 - b * 0.012, 0.9);
			const mid = (a0 + a1) / 2;
			holeGroup.add(cloud);
			bands.push({ cloud, speed: 0.55 * (R / mid) ** 1.5, mid });
		}
	}

	// Light bent around the shadow. It always faces the camera.
	const halo = (() => {
		const pos: number[] = [];
		const col: number[] = [];
		for (let i = 0; i < 6000; i++) {
			const f = Math.random() ** 2.2;
			const r = R * (1.04 + f * 0.75);
			const a = Math.random() * TAU;
			const k = 0.25 + 0.75 * (1 - f) * (1 - f);
			pos.push(Math.cos(a) * r, Math.sin(a) * r, 0);
			col.push(k, 0.86 * k, 0.62 * k);
		}
		return points(pos, col, 0.2, 0.85);
	})();
	holeGroup.add(halo);
	holeGroup.add(
		glowSprite(
			glowTexture(
				[
					[0, 'rgba(0,0,0,0)'],
					[0.5, 'rgba(255,230,180,0)'],
					[0.545, 'rgba(255,236,196,0.95)'],
					[0.62, 'rgba(255,160,70,0.5)'],
					[0.8, 'rgba(220,90,40,0.12)'],
					[1, 'rgba(120,30,20,0)'],
				],
				512,
			),
			0xffffff,
			R * 3.78,
			1,
		),
	);
	holeGroup.add(glowSprite(soft, GLOW, R * 17, 0.16));

	// Tech icons in dark round chips, spiralling in. The label shows until (or unless) the logo loads.
	const icons = cosmos.showOrbitIcons ? cosmos.orbitIcons : [];
	const orbs = icons.map(([id, label], i) => {
		const chip = document.createElement('canvas');
		chip.width = chip.height = 128;
		const map = new CanvasTexture(chip);
		const paint = (logo: CanvasImageSource | null) => {
			const x = chip.getContext('2d')!;
			x.clearRect(0, 0, 128, 128);
			x.fillStyle = 'rgba(14,18,28,0.92)';
			x.strokeStyle = 'rgba(255,255,255,0.3)';
			x.lineWidth = 2;
			x.beginPath();
			x.arc(64, 64, 58, 0, TAU);
			x.fill();
			x.stroke();
			if (logo) {
				x.drawImage(logo, 30, 30, 68, 68);
			} else {
				x.fillStyle = '#fff';
				x.font = "700 30px 'Syne', sans-serif";
				x.textAlign = 'center';
				x.textBaseline = 'middle';
				x.fillText(label, 64, 66);
			}
			map.needsUpdate = true;
		};
		paint(null);
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				// Black logos become white.
				const c = document.createElement('canvas');
				c.width = c.height = 96;
				const x = c.getContext('2d')!;
				x.drawImage(img, 0, 0, 96, 96);
				if (darkIcons.includes(id)) {
					x.globalCompositeOperation = 'source-in';
					x.fillStyle = '#fff';
					x.fillRect(0, 0, 96, 96);
				}
				paint(c);
				renderStill();
			} catch {
				// Keep the text label.
			}
		};
		img.src = iconUrl(id);
		const sprite = new Sprite(new SpriteMaterial({ map, transparent: true, depthWrite: false }));
		holeGroup.add(sprite);
		return { sprite, a: Math.random() * TAU, r: R * (1.4 + (i / icons.length) * 3.1) };
	});

	// Ringed planet with a moon, lit by a far sun.
	const planet = new Group();
	planet.position.copy(PLANET);
	planet.rotation.set(0.42, 0, 0.22);
	scene.add(planet);
	const ball = new Mesh(
		new SphereGeometry(6, 64, 48),
		new MeshStandardMaterial({ map: planetTexture(), roughness: 1, metalness: 0 }),
	);
	planet.add(ball);
	const ring = (() => {
		const pos: number[] = [];
		const col: number[] = [];
		for (let i = 0; i < 16000; i++) {
			let r = 8.4 + Math.random() * 5.8;
			// A gap in the ring.
			if (r > 10.7 && r < 11.2) r += 0.6;
			const a = Math.random() * TAU;
			const b = 0.3 + Math.random() * 0.6;
			const warm = Math.sin(r * 3.1) > 0.2;
			pos.push(Math.cos(a) * r, (Math.random() - 0.5) * 0.06, Math.sin(a) * r);
			col.push(b * (warm ? 0.95 : 0.7), b * (warm ? 0.93 : 0.8), b * (warm ? 0.88 : 1));
		}
		return points(pos, col, 0.16, 0.9);
	})();
	planet.add(ring);
	const moon = new Mesh(
		new SphereGeometry(1, 32, 24),
		new MeshStandardMaterial({ color: 0xc8ccd8, roughness: 1, metalness: 0 }),
	);
	planet.add(moon);
	const air = glowSprite(soft, 0x7fa0e0, 21, 0.4);
	air.position.copy(PLANET);
	scene.add(air);
	// Light strengths are the design's (1.8 and 0.9) times π, which newer three.js needs for the same look.
	const sun = new DirectionalLight(0xffdcb0, 1.8 * Math.PI);
	sun.position.set(72, 16, 46);
	scene.add(sun);
	scene.add(new AmbientLight(0x2a1f4d, 0.9 * Math.PI));

	// Spiral galaxy, far away. It brightens as the camera gets near the end of the page.
	const galaxyGroup = new Group();
	galaxyGroup.position.copy(GALAXY);
	galaxyGroup.rotation.set(1.0, 0, 0.3);
	scene.add(galaxyGroup);
	const galaxy = (() => {
		const size = 95;
		const arms = 4;
		const core = new Color(1, 0.82, 0.58);
		const blue = new Color(0.55, 0.7, 1);
		const pink = new Color(1, 0.35, 0.45);
		const pale = new Color(0.85, 0.9, 1);
		const color = new Color();
		const pos: number[] = [];
		const col: number[] = [];
		for (let i = 0; i < 26000; i++) {
			const r = Math.random() ** 1.7 * size;
			const arm = ((i % arms) / arms) * TAU + r * 0.05;
			const spread = 0.25 + r * 0.09;
			pos.push(
				Math.cos(arm) * r + Math.random() ** 3 * sign() * spread,
				Math.random() ** 3 * sign() * spread * 0.35,
				Math.sin(arm) * r + Math.random() ** 3 * sign() * spread,
			);
			const q = Math.random();
			color.copy(core).lerp(q < 0.08 ? pink : q < 0.3 ? pale : blue, Math.min(1, (r / size) * 1.3));
			const k = 0.4 + Math.random() * 0.6;
			col.push(color.r * k, color.g * k, color.b * k);
		}
		return points(pos, col, 1.5, 0.2);
	})();
	galaxyGroup.add(galaxy);
	const galaxyCore = glowSprite(soft, 0xffd9a0, 70, 0.2);
	galaxyGroup.add(galaxyCore);

	let w = 0;
	let h = 0;
	let posCurve: CatmullRomCurve3;
	let lookCurve: CatmullRomCurve3;
	// How far down the page the camera is, 0 to 1. It trails the real scroll a little.
	let p = 0;
	// Collapse: the welcome page's Enter (Welcome.astro) sends `cosmos:collapse` with a duration in
	// seconds. Over that time every star, the disk, and the orbiting icons fall into the hole.
	// Emerge is the same run backwards, on load, when the slot has `data-emerge` (Hero.astro).
	let fallAt = -1;
	let fallFor = 1;
	let inward = false;
	let fall = 0;

	const scrolled = () =>
		still ? 0 : clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 0, 1);

	// Aims the camera so the black hole lands in its slot, and lays out the flight path from there.
	function resize() {
		w = window.innerWidth;
		h = window.innerHeight;
		if (!w || !h) return;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();

		let nx = 0.45;
		let ny = 0;
		let size = Math.min(w, h) * 0.6;
		const rect = slot?.getBoundingClientRect();
		if (rect?.width) {
			nx = ((rect.left + rect.width / 2) / w) * 2 - 1;
			ny = -(((rect.top + window.scrollY + rect.height / 2) / h) * 2 - 1);
			size = rect.width;
		}
		nx = clamp(nx, -0.7, 0.7);
		ny = clamp(ny, -0.5, 0.4);
		const tan = Math.tan(HALF_FOV);
		// The disk (10.4 units wide) fills 60% of the slot.
		const d = clamp((10.4 * (h / 2)) / (tan * 0.6 * size), 20, 62);
		const halfH = tan * d;
		const halfW = (halfH * w) / h;
		posCurve = new CatmullRomCurve3([
			new Vector3(0, 2.6, d),
			new Vector3(-12, 10, 20),
			new Vector3(-38, 8, -8),
			new Vector3(-58, 2, -30),
			new Vector3(-78, 14, -70),
		]);
		lookCurve = new CatmullRomCurve3([
			new Vector3(-nx * halfW, -ny * halfH, 0),
			new Vector3(1, 0, 0),
			PLANET,
			new Vector3(-70, 4, -75),
			new Vector3(GALAXY.x, 4, GALAXY.z),
		]);
	}

	const seen = new Vector3();

	function frame(sec: number, dt: number) {
		// Smooth the mouse (lerp 0.05 per 60fps frame).
		const ease = 1 - (1 - 0.05) ** (dt * 60);
		mouse.x += (mouse.tx - mouse.x) * ease;
		mouse.y += (mouse.ty - mouse.y) * ease;
		p += (scrolled() - p) * Math.min(1, dt * 3.5);
		if (fallAt >= 0) {
			const q = clamp((sec - fallAt) / fallFor, 0, 1);
			// Falling in speeds up; emerging bursts out, then settles.
			fall = inward ? q ** 2 : (1 - q) ** 2;
		}

		posCurve.getPoint(p, camera.position);
		lookCurve.getPoint(p, target);
		camera.lookAt(target);
		camera.translateX(mouse.x * 1.8);
		camera.translateY(-mouse.y * 1.2);
		camera.lookAt(target);

		// Falling, the whole sky shrinks into the hole along a spiral.
		sky.position.copy(camera.position).lerp(ORIGIN, fall);
		sky.scale.setScalar(Math.max(0.001, 1 - fall));
		sky.rotation.y = sec * 0.004 + fall * fall * 2.4;
		for (const cloud of nebula) cloud.sprite.material.opacity = cloud.opacity * (1 - fall);

		holeGroup.rotation.x = 0.24 + mouse.y * 0.06;
		holeGroup.rotation.z = -0.2 + mouse.x * 0.05;
		// Everything orbits faster near the horizon, and fastest while falling in.
		const odt = dt * (1 + (inward ? 24 : 4) * fall);
		for (const band of bands) {
			band.cloud.rotation.y -= band.speed * odt;
			// Falling or emerging, the disk is squeezed onto the horizon.
			band.cloud.scale.setScalar(1 - (1 - (R * 1.05) / band.mid) * fall);
		}
		halo.lookAt(camera.position);
		for (const orb of orbs) {
			if (orb.r <= 0) continue;
			const k = R / orb.r;
			orb.a += odt * 0.5 * k ** 1.3;
			orb.r -= odt * R * (0.07 + 0.4 * k * k);
			if (orb.r < R * 1.08) {
				if (inward) {
					orb.r = 0;
					orb.sprite.visible = false;
					continue;
				}
				orb.r = OUTER;
				orb.a = Math.random() * TAU;
			}
			const radius = orb.r - (orb.r - R) * fall;
			const near = clamp((radius - R * 1.1) / (R * 1.3), 0, 1);
			const born = clamp((OUTER - orb.r) / (R * 0.5), 0, 1);
			const size = 1.25 * (0.3 + 0.7 * near);
			orb.sprite.position.set(Math.cos(orb.a) * radius, 0.2, -Math.sin(orb.a) * radius);
			orb.sprite.scale.set(size, size, 1);
			orb.sprite.material.opacity = near * born;
		}

		ball.rotation.y += dt * 0.05;
		ring.rotation.y += dt * 0.02;
		moon.position.set(Math.cos(sec * 0.22) * 17.5, 1.2, Math.sin(sec * 0.22) * 17.5);

		const arriving = smooth(0.45, 0.95, p);
		galaxy.rotation.y += dt * 0.02;
		(galaxy.material as PointsMaterial).opacity = 0.18 + 0.8 * arriving;
		galaxyCore.material.opacity = 0.15 + 0.6 * arriving;

		// The page darkens a little over the sections with the most text.
		if (dim) dim.style.opacity = (0.42 * smooth(0.04, 0.2, p) - 0.14 * smooth(0.82, 1, p)).toFixed(3);

		renderer.render(scene, camera);

		seen.copy(ORIGIN).project(camera);
		hole.x = ((seen.x + 1) / 2) * w;
		hole.y = ((1 - seen.y) / 2) * h;
		hole.r = (R * (h / 2)) / (Math.tan(HALF_FOV) * camera.position.length());
	}

	resize();
	p = scrolled();

	window.addEventListener('resize', () => {
		resize();
		renderStill();
	});
	if (slot) {
		new ResizeObserver(() => {
			resize();
			renderStill();
		}).observe(slot);
	}

	// Reduced motion: one static frame, no flight, no spiral.
	if (still) {
		renderStill();
		return;
	}

	if (slot?.hasAttribute('data-emerge')) {
		fallAt = performance.now() / 1000;
		fallFor = 1.8;
		fall = 1;
	}

	// The mouse lets go of the view, so the hole settles in the middle of its slot.
	window.addEventListener('cosmos:collapse', (event) => {
		fallAt = performance.now() / 1000;
		fallFor = (event as CustomEvent<number>).detail || 2;
		inward = true;
		mouse.tx = mouse.ty = 0;
	});

	window.addEventListener('pointermove', (e) => {
		if (inward) return;
		mouse.tx = e.clientX / window.innerWidth - 0.5;
		mouse.ty = e.clientY / window.innerHeight - 0.5;
	});

	let last: number | null = null;
	const loop = (t: number) => {
		const sec = t / 1000;
		const dt = last === null ? 0 : Math.min(0.05, sec - last);
		last = sec;
		frame(sec, dt);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}

// Cloud bands for the planet: random stripes, then thin light and dark streaks.
function planetTexture() {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 256;
	const x = c.getContext('2d')!;
	const palette = ['#1a2238', '#2b3a5c', '#4a5f8a', '#8fa3c8', '#d8dfee', '#35476e', '#141b2e', '#b9c4dc'];
	const g = x.createLinearGradient(0, 0, 0, 256);
	for (let y = 0, i = 0; y < 1; y += 0.05 + Math.random() * 0.11, i += 1 + Math.floor(Math.random() * 3)) {
		g.addColorStop(y, palette[i % palette.length]);
	}
	g.addColorStop(1, palette[0]);
	x.fillStyle = g;
	x.fillRect(0, 0, 512, 256);
	for (let k = 0; k < 260; k++) {
		x.globalAlpha = 0.05 + Math.random() * 0.1;
		x.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#0c1220';
		x.beginPath();
		x.ellipse(Math.random() * 512, Math.random() * 256, 20 + Math.random() * 120, 0.6 + Math.random() * 2.2, 0, 0, TAU);
		x.fill();
	}
	return new CanvasTexture(c);
}
