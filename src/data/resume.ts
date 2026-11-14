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
				"I BUILD CPU": {
					kind: "โปรเจกต์กลุ่ม · ปี 1",
					description:
						"ร้านค้าออนไลน์สำหรับชิ้นส่วนคอมพิวเตอร์ พัฒนาโดยทีมนักศึกษาปี 1 ด้วย Spring Boot และ Clean Architecture: เข้าสู่ระบบด้วย JWT, สินค้าและหมวดหมู่, คำสั่งซื้อ, เติมเครดิต, รีวิว, อัปโหลดรูปภาพไปยัง MinIO และแดชบอร์ดผู้ดูแลระบบ รับหน้าที่ประสานงานทีมและพัฒนา use case ต่าง ๆ แต่เวลาส่วนใหญ่ใช้ไปกับการสอนเพื่อนร่วมทีม เพราะโปรเจกต์นี้ยากกว่าระดับปี 1 ไปมาก",
				},
				Nabla: {
					points: [
						"พัฒนาเอนจิน autodiff แบบ reverse-mode และไลบรารี Neural Network ด้วย C++23 แบบ header-only โดยไม่ใช้ dependency ใด ๆ",
						"ทดสอบกับชุดข้อมูล MNIST ได้ความแม่นยำ 98%",
					],
				},
				"Task API": {
					kind: "REST API · Rust → TypeScript",
					description:
						"REST API สำหรับจัดการงาน (Task/Todo) ที่เดิมสร้างขึ้นเพื่อเรียนรู้ Rust ด้วย ntex และปัจจุบันเขียนใหม่ด้วย TypeScript บน Bun และ Elysia ตามแนวทาง Clean Architecture โดยยังใช้ PostgreSQL: สร้าง แสดงรายการ แก้ไข และลบงาน พร้อมตรวจสอบข้อมูล กรองตามสถานะ กำหนดวันครบกำหนดและกรองตามช่วงวันที่ แบ่งหน้า และใช้รูปแบบ JSON error เดียวกันทั้งหมด มีไคลเอนต์ขนาดเล็กด้วย React + TypeScript และสคริปต์ acceptance test 86 รายการ",
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
