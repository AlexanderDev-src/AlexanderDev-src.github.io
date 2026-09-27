// All page content lives here. Edit this file to fill the layout with your own details.

export const site = {
	name: 'Your Name',
	role: 'Designer & Developer',
	location: 'City, Country',
	email: 'hello@example.com',
	available: true,
	// Each entry renders as its own line in the hero headline.
	headline: ['I design and build', 'digital experiences', 'people remember.'],
	intro:
		'One or two sentences about what you do, who you do it for, and what makes your work different.',
};

export const nav = [
	{ label: 'Work', href: '#work' },
	{ label: 'About', href: '#about' },
	{ label: 'Experience', href: '#experience' },
	{ label: 'Skills', href: '#skills' },
	{ label: 'Contact', href: '#contact' },
];

export const socials = [
	{ label: 'GitHub', href: 'https://github.com/' },
	{ label: 'LinkedIn', href: 'https://linkedin.com/' },
	{ label: 'Dribbble', href: 'https://dribbble.com/' },
	{ label: 'X', href: 'https://x.com/' },
];

export const about = {
	lead: 'A short, bold statement about who you are and how you approach your craft.',
	paragraphs: [
		'Paragraph about your background: where you started, what pulled you into this field, and what you focus on today.',
		'Paragraph about how you work: your process, the kind of teams you enjoy, and what you care about when shipping.',
	],
};

export const stats = [
	{ value: '5+', label: 'Years experience' },
	{ value: '40+', label: 'Projects shipped' },
	{ value: '12', label: 'Awards & features' },
];

// Bento grid sizes: 'large' (4x2), 'tall' (2x2), 'wide' (3x1), 'default' (2x1) on a 6-column grid.
// Rows fill best when each row's spans add up to 6.
export type ProjectSize = 'large' | 'tall' | 'wide' | 'default';

export interface Project {
	title: string;
	description: string;
	year: string;
	tags: string[];
	href: string;
	size?: ProjectSize;
}

export const projects: Project[] = [
	{
		title: 'Project One',
		description: 'Flagship project. What it is, the problem it solved, and the result.',
		year: '2026',
		tags: ['Web App', 'Design'],
		href: '#',
		size: 'large',
	},
	{
		title: 'Project Two',
		description: 'Short description of the project and your role in it.',
		year: '2026',
		tags: ['Mobile'],
		href: '#',
		size: 'tall',
	},
	{
		title: 'Project Three',
		description: 'Short description of the project and your role in it.',
		year: '2025',
		tags: ['Branding'],
		href: '#',
	},
	{
		title: 'Project Four',
		description: 'Short description of the project and your role in it.',
		year: '2025',
		tags: ['Open Source'],
		href: '#',
	},
	{
		title: 'Project Five',
		description: 'Short description of the project and your role in it.',
		year: '2024',
		tags: ['E-commerce'],
		href: '#',
	},
];

export const experience = [
	{
		period: '2024 — Now',
		role: 'Senior Role',
		company: 'Company Name',
		summary: 'What you own, what you shipped, and the impact it had.',
	},
	{
		period: '2022 — 2024',
		role: 'Role Title',
		company: 'Company Name',
		summary: 'What you own, what you shipped, and the impact it had.',
	},
	{
		period: '2020 — 2022',
		role: 'Role Title',
		company: 'Company Name',
		summary: 'What you own, what you shipped, and the impact it had.',
	},
	{
		period: '2019 — 2020',
		role: 'Junior Role',
		company: 'Company Name',
		summary: 'What you own, what you shipped, and the impact it had.',
	},
];

export const skills = [
	{ group: 'Design', items: ['UI Design', 'Prototyping', 'Design Systems', 'Motion'] },
	{ group: 'Frontend', items: ['TypeScript', 'Astro', 'React', 'CSS', 'GSAP'] },
	{ group: 'Backend', items: ['Node.js', 'PostgreSQL', 'REST', 'GraphQL'] },
	{ group: 'Tools', items: ['Figma', 'Git', 'Vite', 'Vercel'] },
];
