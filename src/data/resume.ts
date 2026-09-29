// Everything on the résumé lives here. Each language in site.resume gets its own PDF, made from this
// file when the site builds (see src/pages/[file].pdf.ts). Most of it comes from site.ts, so the
// résumé follows the site. Put your own text in place of any of it when the résumé needs something
// different. Run the dev server and open the PDF to see a change.

import { site, skills, socials, timeline } from "./site";

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
	projects: Record<string, { kind?: string; description?: string }>;
	// Other names for the skill groups in site.ts, by group name.
	skillGroups: Record<string, string>;
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
	};
}

export interface Resume {
	// Links under the name, in this order. They print without "https://", so they still read on paper.
	links: string[];
	// Projects to list, by name in site.ts, in this order. Leave it empty to list all of them, newest first.
	projects: string[];
	skills: { group: string; items: string[] }[];
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
	projects: ["Nabla", "LexiLog"],
	skills: skills.map((group) => ({
		group: group.group,
		items: group.items.map((item) => item.name),
	})),
	text: {
		en: {
			name: "Patcharapol Pantawee",
			aka: site.name,
			headline: site.role,
			location: "",
			summary: site.intro,
			education: timeline,
			experience: [],
			projects: {},
			skillGroups: {},
			labels: {
				title: "Résumé",
				aka: "aka",
				summary: "Summary",
				education: "Education",
				experience: "Experience",
				projects: "Projects",
				skills: "Skills",
			},
		},
		th: {
			name: "พัชรพล พันทวี",
			aka: site.name,
			headline: "นักศึกษา · Junior Developer",
			location: "",
			summary:
				"นักศึกษาชั้นปีที่ 2 และนักพัฒนาระดับจูเนียร์ พัฒนาเว็บแอปแบบ Full-stack และกำลังศึกษาด้าน Data Science, Machine Learning และ Deep Learning ปัจจุบันเน้นการเรียนเป็นหลัก แต่ยังเปิดรับโอกาสฝึกงานอยู่",
			education: [
				{
					title: "วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
					place: "มหาวิทยาลัยขอนแก่น",
					when: "2025 — ปัจจุบัน",
				},
			],
			experience: [],
			projects: {
				LexiLog: {
					kind: "เว็บแอป Full-stack",
					description:
						"แอปฝึก IELTS ส่วนตัวที่รวมการฝึกคำศัพท์และการเขียนไว้ในที่เดียว: ทบทวนคำศัพท์แบบ Spaced Repetition สไตล์ Anki (FSRS) และหน้าเขียนเรียงความแบบจับเวลา พร้อมฉบับร่าง ฟีดแบ็ก และการติดตามข้อผิดพลาด",
				},
				"I BUILD CPU": {
					kind: "โปรเจกต์กลุ่ม · ปี 1",
					description:
						"ร้านค้าออนไลน์สำหรับชิ้นส่วนคอมพิวเตอร์ พัฒนาโดยทีมนักศึกษาปี 1 ด้วย Spring Boot และ Clean Architecture: เข้าสู่ระบบด้วย JWT, สินค้าและหมวดหมู่, คำสั่งซื้อ, เติมเครดิต, รีวิว, อัปโหลดรูปภาพไปยัง MinIO และแดชบอร์ดผู้ดูแลระบบ รับหน้าที่ประสานงานทีมและพัฒนา use case ต่าง ๆ แต่เวลาส่วนใหญ่ใช้ไปกับการสอนเพื่อนร่วมทีม เพราะโปรเจกต์นี้ยากกว่าระดับปี 1 ไปมาก",
				},
				Nabla: {
					description:
						"∇ : เอนจิน autodiff แบบ reverse-mode ขนาดเล็ก และไลบรารี Neural Network ด้วย C++23 แบบ header-only ไม่มี dependency ใด ๆ ได้ความแม่นยำ 98% บน MNIST",
				},
				"Task API": {
					kind: "REST API · ฝึกเขียน Rust",
					description:
						"REST API สำหรับจัดการงาน (Task/Todo) ที่สร้างขึ้นเพื่อเรียนรู้ Rust ด้วย ntex และ PostgreSQL: สร้าง แสดงรายการ แก้ไข และลบงาน พร้อมตรวจสอบข้อมูล กรองตามสถานะ แบ่งหน้า และใช้รูปแบบ JSON error เดียวกันทั้งหมด มีไคลเอนต์ขนาดเล็กด้วย React + TypeScript และสคริปต์ acceptance test 54 รายการ",
				},
				"Social Media & Mental Health": {
					kind: "Data Science · ปี 2",
					description:
						"ศึกษาว่าเวลาที่ใช้บนโซเชียลมีเดียและประเภทของเนื้อหาสัมพันธ์กับสุขภาวะทางจิตของนักศึกษามหาวิทยาลัยอย่างไร ชุดข้อมูลสาธารณะบน Kaggle กลายเป็นข้อมูลสังเคราะห์ จึงทำแบบสำรวจเองที่มหาวิทยาลัยขอนแก่น (นักศึกษา 121 คน, DASS-21 ฉบับภาษาไทย) และวิเคราะห์ด้วย Python จนถึงตอนนี้ จำนวนชั่วโมงที่ออนไลน์ยังไม่สัมพันธ์กับภาวะซึมเศร้า ความวิตกกังวล หรือความเครียด ส่วนปัญหาด้านการเงินสัมพันธ์มากที่สุด",
				},
			},
			skillGroups: {
				"Languages & Frameworks": "ภาษาและเฟรมเวิร์ก",
				"Frontend & Markup": "Frontend และ Markup",
				Database: "ฐานข้อมูล",
				"Data & AI": "Data และ AI",
				"OS & Tools": "ระบบปฏิบัติการและเครื่องมือ",
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
				skills: "ทักษะ",
			},
		},
	},
};
