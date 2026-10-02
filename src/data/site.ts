// All page content lives here. Edit this file to fill the layout with your own details.

export const site = {
	name: "Alexander Sanford",
	role: "Student · Junior Developer",
	focus: "Web · Data · AI",
	status: "Studying & building projects · Open to internships",
	email: "alexander.sanford.contact@pm.me",
	// Résumé PDFs, one per language, made from src/data/resume.ts when the site builds.
	// The path sets the file's URL and the name it saves under.
	resume: {
		en: "/Alexander-Sanford-Resume.pdf",
		th: "/Alexander-Sanford-Resume-TH.pdf",
	},
	// IANA time zone for the "Local time" clock in the hero. Use undefined to show the visitor's time.
	timeZone: "Asia/Bangkok" as string | undefined,
	intro:
		"I'm a second year student in University and junior developer. I build full-stack web apps, and I explore data science, machine learning, and deep learning. Right now I'm focus on studying but still looking for internships",
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
	{ label: "Résumé (PDF) (Still on Update)", href: site.resume.en },
	{ label: "Résumé ภาษาไทย (PDF)", href: site.resume.th },
];

export const about = {
	// Path to your photo in /public (e.g. '/portrait.jpg'). Leave empty to show a placeholder.
	portrait: "/Myself/me.webp",
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
	// Topics for the filter buttons above the projects, like "Full-stack" or "Machine Learning". Not shown on the card.
	topics?: string[];
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

const MONTHS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

// Turns a project date like "Sep 2026" or "2026" into a number for sorting. A year alone counts as January.
export const projectTime = (date: string) => {
	const match = date.match(/(?:([a-z]{3})[a-z]*\s+)?(\d{4})/i);
	if (!match) return 0;
	const month = match[1]
		? Math.max(MONTHS.indexOf(match[1].toLowerCase()), 0)
		: 0;
	return Number(match[2]) * 12 + month;
};

// Filter buttons above the projects. Each one matches a project's topics or tags (case does not matter).
// A button only shows when at least one project matches it, so topics with no projects yet can stay here.
export const projectFilters = {
	topics: [
		"Full-stack",
		"Back-end",
		"Front-end",
		"Machine Learning",
		"Deep Learning",
		"Data Science",
		"Neural Network",
	],
	languages: ["Rust", "Java", "C++", "C", "Python", "TypeScript", "JavaScript"],
};

// How many projects show at first. The rest open with the floating "Show more" button.
// The limit applies to whatever the filter shows, so a filter with more matches gets the button too.
export const projectsShown = 4;

// Everything a project can be filtered by, in lower case.
export const projectFilterKeys = (project: Project) =>
	[...(project.topics ?? []), ...project.tags].map((key) => key.toLowerCase());

// Shown newest first by date, so the order here does not matter.
export const projects: Project[] = [
	{
		name: "LexiLog",
		year: "Sep 2026",
		kind: "Full-stack web app",
		topics: ["Full-stack"],
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
	{
		name: "I BUILD CPU",
		year: "May 2026",
		kind: "Team project · Year 1",
		topics: ["Back-end"],
		draft: true,
		draftNote:
			"Limit test: Spring Boot + Clean Architecture with a team of first-years who had just learned Java. Why did I do this to myself? lmao",
		description:
			"An online store for computer parts, built by our first-year team with Spring Boot and Clean Architecture: JWT sign-in, products and categories, orders, credit top-ups, reviews, image uploads to MinIO, and an admin dashboard. I coordinated the team and implemented the use cases, but most of my time went into teaching my teammates, since the project was a big step up for first-years.",
		tags: [
			"Java",
			"Spring Boot",
			"Clean Architecture",
			"PostgreSQL",
			"MinIO",
			"Docker",
		],
		photos: [
			{ src: "/projects/i-build-cpu/1.webp", caption: "Store" },
			{ src: "/projects/i-build-cpu/2.webp", caption: "Product" },
			{ src: "/projects/i-build-cpu/3.webp", caption: "Reviews" },
			{ src: "/projects/i-build-cpu/4.webp", caption: "My orders" },
			{ src: "/projects/i-build-cpu/5.webp", caption: "Transactions" },
			{ src: "/projects/i-build-cpu/6.webp", caption: "Top-up" },
			{ src: "/projects/i-build-cpu/7.webp", caption: "Admin dashboard" },
			{ src: "/projects/i-build-cpu/8.webp", caption: "API docs (Swagger)" },
		],
		code: "https://github.com/Ax-47/java_project",
	},
	{
		name: "Nabla",
		year: "Sep 2026",
		kind: "Neural Network",
		topics: ["Neural Network", "Deep Learning"],
		draft: true,
		draftNote: "Status 20%",
		description:
			"∇ : A tiny reverse-mode autodiff engine and neural network library in C++23. Header-only, zero dependencies, 98% on MNIST.",
		tags: ["C++", "Neural Network", "Deep Learning"],
		photos: [
			{ src: "/projects/nabla/1.png", caption: "autograd" },
			{ src: "/projects/nabla/2.png", caption: "cpp impl" },
		],
		code: "https://github.com/AlexanderDev-src/nabla",
	},
	{
		name: "Task API",
		year: "Aug 2026",
		kind: "REST API · Learning Rust",
		topics: ["Back-end"],
		draft: true,
		draftNote:
			"Status: Working on a login system, but I don't have free time for it yet.",
		description:
			"A Task/Todo REST API I built to learn Rust, with ntex and PostgreSQL: create, list, update, and delete tasks with validation, status filters, paging, and one JSON error shape. It has a small React + TypeScript client and a 54-check acceptance script.",
		tags: ["Rust", "ntex", "PostgreSQL", "React", "TypeScript", "Docker"],
		photos: [
			{ src: "/projects/taskapi/taskapi1.png", caption: "Board" },
			{ src: "/projects/taskapi/taskapi2.png", caption: "List" },
		],
		code: "https://github.com/AlexanderDev-src/rust-ntex-task-api",
	},
	{
		name: "Social Media & Mental Health",
		year: "Aug 2026",
		kind: "Data Science · Year 2",
		topics: ["Data Science"],
		draft: true,
		draftNote:
			"Still analysing the survey one research question at a time. The full report isn't written yet.",
		description:
			"A study of how time on social media, and the kind of content, relate to university students' mental well-being. The public Kaggle datasets turned out to be synthetic, so I ran my own survey at Khon Kaen University (121 students, Thai DASS-21) and analysed it in Python. So far, hours online show no link to depression, anxiety, or stress. Money problems show the strongest link.",
		tags: ["Python", "pandas", "SciPy", "Matplotlib", "LaTeX"],
		photos: [
			{
				src: "/projects/social-mental-health/what-if-social-media.gif",
				caption: "What if: social media hours vs. DASS-21",
			},
			{
				src: "/projects/social-mental-health/usage-vs-mental-health.png",
				caption: "Kaggle data (synthetic): hours vs. mental health score",
			},
			{
				src: "/projects/social-mental-health/q1-usage-dass.png",
				caption: "Social media hours vs. DASS-21",
			},
			{
				src: "/projects/social-mental-health/qr2-social-media-dass-dimension.png",
				caption: "Social media hours and news days vs. each DASS-21 dimension",
			},
			{
				src: "/projects/social-mental-health/q3-news-anxiety.png",
				caption: "News days per week vs. DASS-21",
			},
			{
				src: "/projects/social-mental-health/q4-content-type.png",
				caption: "Content type vs. DASS-21",
			},
			{
				src: "/projects/social-mental-health/q5-interaction-dass.png",
				caption: "Daily habits vs. DASS-21 (correlations)",
			},
			{
				src: "/projects/social-mental-health/3d-usage-sleep-dass.png",
				caption: "Social media, sleep, and DASS-21: female vs. male",
			},
			{
				src: "/projects/social-mental-health/q6-gpa-finance.png",
				caption: "GPA and money vs. DASS-21",
			},
			{
				src: "/projects/social-mental-health/qr7-finance-dass-dimension.png",
				caption: "Money situation vs. each DASS-21 dimension",
			},
		],
		code: "https://github.com/AlexanderDev-src/DataSci_Social_and_MentalHealth",
<<<<<<< HEAD
=======
		demo: "https://alexanderdev-src.github.io/DataSci_Social_and_MentalHealth/",
>>>>>>> ef27c8d (Add web presentation)
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
	"astro",
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
			{ id: "svelte", name: "Svelte" },
			{ id: "astro", name: "Astro" },
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
