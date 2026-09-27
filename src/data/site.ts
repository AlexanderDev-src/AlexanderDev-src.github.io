// All page content lives here. Edit this file to fill the layout with your own details.

export const site = {
	name: "Alexander Sanford",
	role: "Student · Junior Developer",
	focus: "Web · Data · AI",
	status: "Studying & building projects · Open to internships",
	email: "alexander.sanford.contact@pm.me",
	resume: "#",
	// IANA time zone for the "Local time" clock in the hero. Use undefined to show the visitor's time.
	timeZone: "Asia/Bangkok" as string | undefined,
	intro:
		"I'm a 2nd year student in University and junior developer. I build full-stack web apps, and I explore data science, machine learning, and deep learning. Right now I'm focus on studying but still looking for internships",
};

export const nav = [
	{ label: "Projects", href: "#work" },
	{ label: "Skills", href: "#skills" },
	{ label: "About", href: "#about" },
	{ label: "Contact", href: "#contact" },
];

export const socials = [
	{ label: "GitHub", href: "https://github.com/AlexanderDev-src" },
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/patcharapolandalexnader",
	},
	{ label: "Kaggle", href: "https://kaggle.com/" },
	{ label: "Résumé (PDF) (Not finished yet)", href: site.resume },
];

export const about = {
	// Path to your photo in /public (e.g. '/portrait.jpg'). Leave empty to show a placeholder.
	portrait: "",
	quote: {
		before: "I'm curious about how things work — so I ",
		highlight: "build them",
		after: " to find out.",
	},
	bio: "I'm studying Computer Science and building side projects in my free time. I started with web development, then got curious about data and AI. I enjoy learning new tools, writing clean code, and working with a team. I'm still early in my career, and I want to learn from people who know more than me.",
};

export interface ProjectPhoto {
	src: string;
	caption: string;
}

export interface Project {
	name: string;
	year: string;
	kind: string;
	description: string;
	tags: string[];
	// Path to a 16:10 screenshot in /public. Leave empty to show a placeholder.
	image?: string;
	// Photos for the card collage and the gallery (paths in /public).
	// Leave empty (and no image) to show placeholder photos with the draftNote below.
	photos?: ProjectPhoto[];
	// Show the draft note. Defaults to true when there are no photos and no image.
	draft?: boolean;
	// Note for this project while it is a draft. Defaults to draftNote below.
	draftNote?: string;
	demo?: string;
	code?: string;
}

// Shown on projects that still use placeholder photos.
export const draftNote =
	"Not finished yet. I'm still working on this project. The photos are placeholders only.";

// Stand-in photos from picsum.photos until a project has its own.
export const placeholderPhotos = (seed: string, count = 6): ProjectPhoto[] =>
	Array.from({ length: count }, (_, i) => ({
		src: `https://picsum.photos/seed/${seed}-${i}/900/1100`,
		caption: "Placeholder image",
	}));

export const projects: Project[] = [
	{
		name: "LexiLog",
		year: "2026",
		kind: "Full-stack web app",
		draft: true,
		draftNote:
			"In my config it's using tailscale to connect website only because for my security when I'm on public network <3",
		description:
			"A personal IELTS practice app that keeps vocabulary and writing in one place: Anki-style spaced repetition (FSRS) plus a timed writing editor with drafts, feedback, and mistake tracking.",
		tags: ["Rust", "Svelte", "TypeScript", "SQLite", "Docker"],
		photos: [
			{ src: "/projects/lexilog/1.png", caption: "Today" },
			{ src: "/projects/lexilog/2.png", caption: "Vocabulary deck" },
			{ src: "/projects/lexilog/3.png", caption: "Writing" },
			{ src: "/projects/lexilog/4.png", caption: "Practice log" },
		],
		code: "https://github.com/AlexanderDev-src/lexilog",
	},
];

export const timeline = [
	{
		when: "2025 — Now",
		title: "B.Sc. Computer Science",
		place: "Khon Kean University",
	},
];

// Tech icons come from Devicon (MIT).
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

// Black logos that need inverting to show on the dark background.
export const darkIcons = [
	"rust",
	"nextjs",
	"express",
	"github",
	"markdown",
	"latex",
];

export const deviconUrl = (id: string) => `${DEVICON}${id}/${id}-original.svg`;

export interface Skill {
	id: string;
	name: string;
}

export const skills: { group: string; items: Skill[] }[] = [
	{
		group: "Languages & Frameworks",
		items: [
			{ id: "rust", name: "Rust" },
			{ id: "java", name: "Java" },
			{ id: "cplusplus", name: "C++" },
			{ id: "c", name: "C" },
			{ id: "python", name: "Python" },
			{ id: "typescript", name: "TypeScript" },
			{ id: "javascript", name: "JavaScript" },
			{ id: "react", name: "React" },
		],
	},
	{
		group: "Frontend & Markup",
		items: [
			{ id: "html5", name: "HTML" },
			{ id: "css3", name: "CSS" },
			{ id: "tailwindcss", name: "Tailwind CSS" },
			{ id: "vitejs", name: "Vite" },
			{ id: "nextjs", name: "Next.js" },
			{ id: "markdown", name: "Markdown" },
			{ id: "latex", name: "LaTeX" },
		],
	},
	{
		group: "Backend",
		items: [
			{ id: "spring", name: "Spring" },
			{ id: "nodejs", name: "Node.js" },
			{ id: "express", name: "Express" },
			{ id: "fastapi", name: "FastAPI" },
		],
	},
	{
		group: "Database",
		items: [
			{ id: "postgresql", name: "PostgreSQL" },
			{ id: "sqlite", name: "SQLite" },
			{ id: "mysql", name: "MySQL" },
			{ id: "mongodb", name: "MongoDB" },
		],
	},
	{
		group: "Data & AI",
		items: [
			{ id: "pandas", name: "Pandas" },
			{ id: "numpy", name: "NumPy" },
			{ id: "scikitlearn", name: "scikit-learn" },
			{ id: "pytorch", name: "PyTorch" },
			{ id: "tensorflow", name: "TensorFlow" },
			{ id: "jupyter", name: "Jupyter" },
		],
	},
	{
		group: "OS & Tools",
		items: [
			{ id: "archlinux", name: "Arch Linux" },
			{ id: "neovim", name: "Neovim" },
			{ id: "git", name: "Git" },
			{ id: "github", name: "GitHub" },
			{ id: "docker", name: "Docker" },
			{ id: "postman", name: "Postman" },
			{ id: "vscode", name: "VS Code" },
			{ id: "figma", name: "Figma" },
		],
	},
];

// Background animation settings.
export const cosmos = {
	starDensity: 60, // 10–150
	nebulaIntensity: 20, // 0–120
	showBlackHole: true,
	showOrbitIcons: true,
	// Devicon ids that spiral into the black hole, with a short label shown if the icon fails to load.
	orbitIcons: [
		["rust", "Rs"],
		["java", "Java"],
		["cplusplus", "C++"],
		["c", "C"],
		["javascript", "JS"],
		["typescript", "TS"],
		["python", "Py"],
		["react", "Re"],
		["spring", "Sp"],
		["postgresql", "SQL"],
		["mongodb", "DB"],
		["docker", "Dk"],
		["pytorch", "PT"],
		["tensorflow", "TF"],
		["git", "Git"],
		["neovim", "Nv"],
	],
};
