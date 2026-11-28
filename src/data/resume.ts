// Everything on the résumé lives here. Each language in site.resume gets its own PDF, made from this
// file when the site builds (see src/pages/[file].pdf.ts). Most of it comes from site.ts, so the
// résumé follows the site. Put your own text in place of any of it when the résumé needs something
// different. Run the dev server and open the PDF to see a change.

import { site, socials, timeline } from "./site";

export type ResumeLang = keyof typeof site.resume;

export interface ResumeEntry {
	title: string;
	place: string;
	when: string;
	// Lines under the entry, shown as bullet points.
	points?: string[];
}

export interface ResumeText {
	name: string;
	// Another name you go by, shown under your name as "aka …". Leave empty to hide it.
	aka: string;
	headline: string;
	// Shown before the links, like "Bangkok, Thailand". Leave empty to hide it.
	location: string;
	summary: string;
	education: ResumeEntry[];
	// Jobs and internships. The section only shows when there is at least one.
	experience: ResumeEntry[];
	// Text for single projects, by their name in site.ts. Anything left out uses the site's text.
	// `points` are bullet lines, each starting with what was done. They take the place of the description.
	projects: Record<string, { kind?: string; description?: string; points?: string[] }>;
	// Project dates like "Sep 2026" are rewritten in this locale. Leave it out to keep them as they are.
	dateLocale?: string;
	labels: {
		// Shown in the browser tab and the PDF's details.
		title: string;
		aka: string;
		summary: string;
		education: string;
		experience: string;
		projects: string;
		skills: string;
		// Stands in for "Present" in a project date like "Sep 2026 - Present" when dateLocale is set.
		present: string;
	};
}

// The CV is the long version of the résumé: same header, summary, education and experience, but it
// lists every project and the whole skill list, and has room for extra sections.
export type DocKind = "resume" | "cv";

export interface Cv {
	// Projects to list, by name in site.ts. Leave it empty to list all of them, newest first.
	projects: string[];
	// Shown in the browser tab and the PDF's details, and as the title of the skills section.
	title: Record<ResumeLang, string>;
	skills: Record<ResumeLang, string>;
	// Extra sections after the projects, like activities, awards or certifications. A section with
	// no entries is left out. Each entry is the same shape as an education entry.
	extra: Record<ResumeLang, { title: string; entries: ResumeEntry[] }[]>;
}

export interface Resume {
	// Links under the name, in this order. They print without "https://", so they still read on paper.
	links: string[];
	// Projects to list, by name in site.ts, in this order. Leave it empty to list all of them, newest first.
	projects: string[];
	// The skills that matter most, shown first on the page: one list per column, three columns.
	// Keep it short; the full list lives on the site.
	coreSkills: string[][];
	text: Record<ResumeLang, ResumeText>;
}

const social = (label: string) =>
	socials.find((link) => link.label === label)?.href ?? "";

export const cv: Cv = {
	projects: [],
	title: { en: "Curriculum Vitae", th: "ประวัติย่อ (CV)" },
	skills: { en: "Skills", th: "ทักษะ" },
	extra: {
		en: [
			{ title: "Activities & Awards", entries: [] },
			{ title: "Certifications", entries: [] },
		],
		th: [
			{ title: "กิจกรรมและรางวัล", entries: [] },
			{ title: "ใบรับรอง", entries: [] },
		],
	},
};

export const resume: Resume = {
	links: [
		`mailto:${site.email}`,
		"https://alexanderdev-src.github.io/portfolio",
		social("GitHub"),
		social("LinkedIn"),
	],
	projects: ["Nabla", "Social Media & Mental Health", "LexiLog"],
	coreSkills: [
		["C++, Python, Rust", "TypeScript, Svelte", "PostgreSQL, SQLite, Docker"],
		["Clean Architecture", "Automated Testing", "Team Coordination & Mentoring"],
		["Data Analysis & Statistics", "Research & Technical Writing", "Machine Learning Fundamentals"],
	],
	text: {
		en: {
			name: "Patcharapol Pantawee",
			aka: site.name,
			headline: site.role,
			location: "",
			summary:
				"Second-year Computer Science student at Khon Kaen University and junior developer. Builds full-stack web applications and studies data science, machine learning, and deep learning. Currently focused on coursework and open to internship opportunities.",
			education: timeline.map((entry) => ({ ...entry, points: ["GPA: 3.56 (Present)"] })),
			experience: [],
			projects: {
				Nabla: {
					points: [
						"Developed a reverse-mode automatic differentiation engine and neural network library in C++23, header-only with zero dependencies.",
						"Achieved 98% accuracy on MNIST.",
					],
				},
				"Social Media & Mental Health": {
					points: [
						"Investigated how time on social media and the kind of content relate to university students' mental well-being.",
						"Identified that the public Kaggle datasets were synthetic, then conducted an original survey at Khon Kaen University (121 students, Thai DASS-21).",
						"Analysed the responses in Python; found no link between hours online and depression, anxiety, or stress, and the strongest link with financial problems.",
						"Wrote a full report and a paper in the AUCC conference format.",
					],
				},
				LexiLog: {
					points: [
						"Developed a personal IELTS practice web application that keeps vocabulary and writing in one place.",
						"Implemented Anki-style spaced repetition for vocabulary review with the FSRS algorithm.",
						"Built a timed writing editor with drafts, feedback, and mistake tracking.",
					],
				},
				Meridian: {
					points: [
						"Developed a desktop focus timer with Tauri, Rust, and TypeScript, where each work session is a flight on a real route that lasts about as long as the session.",
						"Built a live globe view that shows the plane crossing the map, with boarding pass, flight data, and sound alerts for landing.",
						"Stored a logbook of past flights in SQLite, with stats, streaks, and tags.",
					],
				},
				"Plagiarism Checker": {
					points: [
						"Developed a full-stack web application that takes an uploaded document and returns a similarity percentage and the matching passages, each linked to its source.",
						"Implemented the checking pipeline in Python and Flask: it picks random phrases, searches Google for them, scrapes the top results, and compares the text.",
						"Built the interface with Svelte and Astro, including a dark mode, and deployed it on Vercel.",
					],
				},
				"Task API": {
					points: [
						"Built a Task/Todo REST API, first in Rust with ntex to learn the language, then rebuilt it in TypeScript on Bun and Elysia with Clean Architecture, on PostgreSQL.",
						"Implemented create, list, update, and delete with input validation, status filters, due dates with a date-range filter, paging, and one consistent JSON error shape.",
						"Wrote a small React + TypeScript client and an 86-check acceptance script.",
					],
				},
				"I BUILD CPU": {
					points: [
						"Built an online store for computer parts with a team of first-year students, using Spring Boot and Clean Architecture.",
						"Implemented JWT sign-in, products and categories, orders, credit top-ups, reviews, image uploads to MinIO, and an admin dashboard.",
						"Coordinated the team and implemented the use cases; spent much of the time teaching teammates, since the project was a big step up for first-years.",
					],
				},
			},
			labels: {
				title: "Résumé",
				aka: "aka",
				summary: "Summary",
				education: "Education",
				experience: "Experience",
				projects: "Projects",
				skills: "Core Skills",
				present: "Present",
			},
		},
		th: {
			name: "พัชรพล พันทวี",
			aka: site.name,
			headline: "นักศึกษา · Junior Developer",
			location: "",
			summary:
				"นักศึกษาชั้นปีที่ 2 สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น และนักพัฒนาระดับจูเนียร์ พัฒนาเว็บแอปแบบ Full-stack และศึกษาด้าน Data Science, Machine Learning และ Deep Learning ปัจจุบันมุ่งเน้นการศึกษาเป็นหลัก และเปิดรับโอกาสฝึกงาน",
			education: [
				{
					title: "วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
					place: "มหาวิทยาลัยขอนแก่น",
					when: "2025 - ปัจจุบัน",
					points: ["เกรดเฉลี่ยสะสม: 3.56 (ปัจจุบัน)"],
				},
			],
			experience: [],
			projects: {
				LexiLog: {
					kind: "เว็บแอป Full-stack",
					points: [
						"พัฒนาเว็บแอปสำหรับฝึก IELTS ที่รวมการฝึกคำศัพท์และการเขียนไว้ในที่เดียว",
						"สร้างระบบทบทวนคำศัพท์แบบ Spaced Repetition สไตล์ Anki ด้วยอัลกอริทึม FSRS",
						"สร้างหน้าเขียนเรียงความแบบจับเวลา พร้อมฉบับร่าง ฟีดแบ็ก และการติดตามข้อผิดพลาด",
					],
				},
				Meridian: {
					kind: "แอปเดสก์ท็อป",
					points: [
						"พัฒนาแอปจับเวลาโฟกัสบนเดสก์ท็อปด้วย Tauri, Rust และ TypeScript โดยแต่ละรอบการทำงานคือหนึ่งเที่ยวบินบนเส้นทางจริงที่ใช้เวลาใกล้เคียงกับรอบนั้น",
						"สร้างหน้าแผนที่โลกที่แสดงเครื่องบินบินข้ามแผนที่ พร้อมบอร์ดดิงพาส ข้อมูลเที่ยวบิน และเสียงแจ้งเตือนเมื่อลงจอด",
						"เก็บบันทึกเที่ยวบินในอดีตด้วย SQLite พร้อมสถิติ สตรีค และแท็ก",
					],
				},
				"Plagiarism Checker": {
					kind: "เว็บแอป Full-stack",
					points: [
						"พัฒนาเว็บแอปแบบ Full-stack ที่รับเอกสารแล้วแสดงเปอร์เซ็นต์ความคล้าย พร้อมข้อความที่ตรงกันและลิงก์ไปยังแหล่งที่มา",
						"พัฒนาขั้นตอนตรวจสอบด้วย Python และ Flask: สุ่มวลี ค้นหาบน Google ดึงข้อมูลจากผลลัพธ์อันดับต้น ๆ แล้วเปรียบเทียบข้อความ",
						"สร้างหน้าจอด้วย Svelte และ Astro รองรับโหมดมืด และนำขึ้นใช้งานบน Vercel",
					],
				},
				"I BUILD CPU": {
					kind: "โปรเจกต์กลุ่ม · ปี 1",
					points: [
						"พัฒนาร้านค้าออนไลน์สำหรับชิ้นส่วนคอมพิวเตอร์ร่วมกับทีมนักศึกษาปี 1 ด้วย Spring Boot และ Clean Architecture",
						"พัฒนาระบบเข้าสู่ระบบด้วย JWT, สินค้าและหมวดหมู่, คำสั่งซื้อ, เติมเครดิต, รีวิว, อัปโหลดรูปภาพไปยัง MinIO และแดชบอร์ดผู้ดูแลระบบ",
						"รับหน้าที่ประสานงานทีมและพัฒนา use case ต่าง ๆ แต่เวลาส่วนใหญ่ใช้ไปกับการสอนเพื่อนร่วมทีม เพราะโปรเจกต์นี้ยากกว่าระดับปี 1 ไปมาก",
					],
				},
				Nabla: {
					points: [
						"พัฒนาเอนจิน autodiff แบบ reverse-mode และไลบรารี Neural Network ด้วย C++23 แบบ header-only โดยไม่ใช้ dependency ใด ๆ",
						"ทดสอบกับชุดข้อมูล MNIST ได้ความแม่นยำ 98%",
					],
				},
				"Task API": {
					kind: "REST API · Rust → TypeScript",
					points: [
						"พัฒนา REST API สำหรับจัดการงาน (Task/Todo) เริ่มด้วย Rust และ ntex เพื่อเรียนรู้ภาษา จากนั้นเขียนใหม่ด้วย TypeScript บน Bun และ Elysia ตามแนวทาง Clean Architecture โดยยังใช้ PostgreSQL",
						"ทำระบบสร้าง แสดงรายการ แก้ไข และลบงาน พร้อมตรวจสอบข้อมูล กรองตามสถานะ กำหนดวันครบกำหนดและกรองตามช่วงวันที่ แบ่งหน้า และใช้รูปแบบ JSON error เดียวกันทั้งหมด",
						"สร้างไคลเอนต์ขนาดเล็กด้วย React + TypeScript และสคริปต์ acceptance test 86 รายการ",
					],
				},
				"Social Media & Mental Health": {
					kind: "Data Science · ปี 2",
					points: [
						"ศึกษาความสัมพันธ์ระหว่างเวลาที่ใช้บนโซเชียลมีเดียและประเภทของเนื้อหา กับสุขภาวะทางจิตของนักศึกษามหาวิทยาลัย",
						"ตรวจสอบชุดข้อมูลสาธารณะบน Kaggle แล้วพบว่าเป็นข้อมูลสังเคราะห์ จึงจัดทำแบบสำรวจเองที่มหาวิทยาลัยขอนแก่น (นักศึกษา 121 คน, DASS-21 ฉบับภาษาไทย)",
						"วิเคราะห์ข้อมูลด้วย Python พบว่าจำนวนชั่วโมงที่ออนไลน์ไม่สัมพันธ์กับภาวะซึมเศร้า ความวิตกกังวล หรือความเครียด ส่วนปัญหาด้านการเงินสัมพันธ์มากที่สุด",
						"จัดทำรายงานฉบับสมบูรณ์และบทความตามรูปแบบ AUCC",
					],
				},
			},
			// Use "th-TH" for Buddhist Era years (2569).
			dateLocale: "th-TH-u-ca-gregory",
			labels: {
				title: "เรซูเม่",
				aka: "aka",
				summary: "ประวัติโดยย่อ",
				education: "การศึกษา",
				experience: "ประสบการณ์",
				projects: "โปรเจกต์",
				skills: "ทักษะหลัก",
				present: "ปัจจุบัน",
			},
		},
	},
};
