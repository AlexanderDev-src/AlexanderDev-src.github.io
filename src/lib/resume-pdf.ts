// Draws the résumé PDF from src/data/resume.ts. Edit the data there; this file is only the layout.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as fontkit from "fontkit";
import PDFDocument from "pdfkit";
import { resume, type ResumeEntry, type ResumeLang } from "../data/resume";
import { projectEnd, projects, projectTime } from "../data/site";

const PAGE = { size: "A4", marginX: 50, marginY: 42 } as const;

// Body text size in points.
const BODY = 9.3;

const COLOR = {
	ink: "#15151f",
	text: "#2d2d35",
	muted: "#62626f",
	accent: "#6635a3",
	rule: "#d6d7de",
};

// Fonts are tried in order for each character: Manrope and Syne (the site's fonts) for Latin text,
// Noto Sans Thai for Thai, and Noto Sans Math for symbols like ∇.
const STACK = {
	regular: ["Manrope-Regular", "NotoSansThai-Regular", "NotoSansMath-Regular"],
	semibold: ["Manrope-SemiBold", "NotoSansThai-SemiBold", "NotoSansMath-Regular"],
	bold: ["Manrope-Bold", "NotoSansThai-Bold", "NotoSansMath-Regular"],
	display: ["Syne-Bold", "NotoSansThai-Bold", "NotoSansMath-Regular"],
};

type Weight = keyof typeof STACK;

interface Part {
	text: string;
	weight?: Weight;
	size?: number;
	color?: string;
	link?: string;
}

const fonts = new Map<string, { data: Buffer; font: fontkit.Font }>();

const loadFont = (name: string) => {
	let entry = fonts.get(name);
	if (!entry) {
		const data = readFileSync(join(process.cwd(), "src/assets/fonts", `${name}.ttf`));
		entry = { data, font: fontkit.create(data) as fontkit.Font };
		fonts.set(name, entry);
	}
	return entry;
};

const THAI = /[฀-๿]/;
const thaiWords = new Intl.Segmenter("th", { granularity: "word" });

// Thai has no spaces between words, so the PDF can't tell where a line may break. Put a zero-width
// space between Thai words to mark it.
const breakThai = (text: string) =>
	THAI.test(text)
		? [...thaiWords.segment(text)].reduce(
				(out, { segment }) =>
					THAI.test(out.slice(-1)) && THAI.test(segment[0]) ? `${out}​${segment}` : out + segment,
				"",
			)
		: text;

// Splits text into pieces that one font can print. Spaces stay with the piece before them, so a
// line doesn't switch fonts at every space.
const fontRuns = (text: string, weight: Weight) => {
	const runs: { font: string; text: string }[] = [];
	for (const char of text) {
		const last = runs.at(-1);
		const code = char.codePointAt(0)!;
		const font =
			last && /[\s​]/.test(char)
				? last.font
				: (STACK[weight].find((name) => loadFont(name).font.hasGlyphForCodePoint(code)) ?? STACK[weight][0]);
		if (last?.font === font) last.text += char;
		else runs.push({ font, text: char });
	}
	return runs;
};

const withoutProtocol = (url: string) => url.replace(/^(mailto:|https?:\/\/(www\.)?)/, "").replace(/\/$/, "");

const MONTH_DATE = /^([a-z]{3})[a-z]*\s+(\d{4})$/i;

const formatMonth = (date: string, locale: string) => {
	if (!MONTH_DATE.test(date)) return date;
	const time = projectTime(date);
	return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
		new Date(Math.floor(time / 12), time % 12),
	);
};

// Rewrites each end of a range like "Aug 2026 - Oct 2026" on its own, and "Present" becomes the résumé's own word.
const formatDate = (date: string, locale: string | undefined, present: string) => {
	if (!locale) return date;
	return date
		.split(/(\s+[-–—]\s+)/)
		.map((part) => (/^present$/i.test(part) ? present : formatMonth(part, locale)))
		.join("");
};

export const resumePdf = (lang: ResumeLang) =>
	new Promise<Buffer>((resolve, reject) => {
		const text = resume.text[lang];
		const doc = new PDFDocument({
			size: PAGE.size,
			margins: { top: PAGE.marginY, bottom: PAGE.marginY, left: PAGE.marginX, right: PAGE.marginX },
			lang,
			displayTitle: true,
			info: {
				Title: `${text.name} — ${text.labels.title}`,
				Author: text.name,
				Subject: text.headline,
			},
		});

		const chunks: Buffer[] = [];
		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", reject);

		for (const name of new Set(Object.values(STACK).flat())) doc.registerFont(name, loadFont(name).data);

		const left = PAGE.marginX;
		const width = doc.page.width - PAGE.marginX * 2;
		const right = left + width;
		const bottom = () => doc.page.height - PAGE.marginY;

		const partRuns = (parts: Part[]) =>
			parts.flatMap(({ text, weight = "regular", ...style }) =>
				fontRuns(breakThai(text), weight).map((run) => ({ ...style, ...run })),
			);

		const measure = (parts: Part[]) =>
			partRuns(parts).reduce((sum, run) => sum + doc.font(run.font).fontSize(run.size ?? BODY).widthOfString(run.text), 0);

		// Thai needs taller lines for the marks above and below the letters.
		const lineGap = THAI.test(JSON.stringify(text)) ? 3.4 : 2;

		// Writes one paragraph, switching fonts inside it as needed.
		const write = (parts: Part[], options: { x?: number; y?: number; width?: number; characterSpacing?: number } = {}) => {
			const runs = partRuns(parts);
			runs.forEach((run, i) => {
				doc.font(run.font).fontSize(run.size ?? BODY).fillColor(run.color ?? COLOR.text);
				const options_ = {
					width: options.width ?? width,
					lineGap,
					characterSpacing: options.characterSpacing ?? 0,
					link: run.link ?? null,
					underline: false,
					continued: i < runs.length - 1,
				};
				if (i === 0 && options.x !== undefined) doc.text(run.text, options.x, options.y ?? doc.y, options_);
				else doc.text(run.text, options_);
			});
			doc.x = left;
		};

		// Starts a new page when less than `height` is left, so a title doesn't sit alone at the bottom.
		const keep = (height: number) => {
			if (doc.y + height > bottom()) doc.addPage();
		};

		// Latin titles are small capitals with wide letter spacing. Thai titles stay unspaced, since
		// spacing pulls the marks off their letters.
		const section = (title: string) => {
			keep(70);
			doc.moveDown(0.75);
			const y = doc.y;
			const thai = THAI.test(title);
			const spacing = thai ? 0 : 1.1;
			const heading: Part[] = [
				{ text: title.toUpperCase(), weight: "bold", size: thai ? 9.5 : 8.5, color: COLOR.accent },
			];
			write(heading, { x: left, y, characterSpacing: spacing });
			const end = left + measure(heading) + [...title].length * spacing + 8;
			doc
				.moveTo(end, y + 5.5)
				.lineTo(right, y + 5.5)
				.lineWidth(0.6)
				.strokeColor(COLOR.rule)
				.stroke();
			doc.y = Math.max(doc.y, y + 12) + 4;
		};

		// A title and subtitle on the left, the date on the right.
		const entryHeader = (title: string, subtitle: string, when: string) => {
			keep(40);
			const y = doc.y;
			const date: Part[] = [{ text: when, size: 8.8, color: COLOR.muted }];
			const dateWidth = when ? measure(date) : 0;
			if (when) write(date, { x: right - dateWidth, y: y + 1, width: dateWidth + 2 });
			const dateBottom = doc.y;
			write(
				[
					{ text: title, weight: "semibold", size: 10.2, color: COLOR.ink },
					...(subtitle ? [{ text: `  ${subtitle}`, size: 9.2, color: COLOR.muted }] : []),
				],
				{ x: left, y, width: width - dateWidth - 16 },
			);
			doc.y = Math.max(doc.y, dateBottom) + 1.5;
		};

		const bullets = (points: string[]) => {
			for (const point of points) {
				const y = doc.y;
				write([{ text: "•", color: COLOR.muted }], { x: left + 2, y });
				write([{ text: point }], { x: left + 12, y, width: width - 12 });
			}
		};

		const entries = (items: ResumeEntry[]) => {
			for (const item of items) {
				entryHeader(item.title, item.place, item.when);
				if (item.points?.length) bullets(item.points);
				doc.moveDown(0.5);
			}
		};

		// Header: the name and headline on the left, the location and links stacked on the right.
		const contact: Part[] = [
			...(text.location ? [{ text: text.location, size: 8.8, color: COLOR.muted }] : []),
			...resume.links.filter(Boolean).map((link) => ({ text: withoutProtocol(link), link, size: 8.8 })),
		];
		const contactWidth = Math.max(0, ...contact.map((part) => measure([part])));
		doc.y = PAGE.marginY + 1;
		for (const part of contact) {
			const partWidth = measure([part]);
			write([part], { x: right - partWidth, y: doc.y, width: partWidth + 2 });
		}
		const contactBottom = doc.y;
		// The name shrinks to stay on one line beside the links.
		const nameWidth = width - contactWidth - 24;
		const name: Part = { text: text.name, weight: "display", size: 24, color: COLOR.ink };
		name.size = Math.min(24, (24 * nameWidth) / measure([name]));
		write([name], { x: left, y: PAGE.marginY, width: nameWidth });
		if (text.aka) write([{ text: `${text.labels.aka} ${text.aka}`, size: 9.5, color: COLOR.muted }], { width: nameWidth });
		doc.moveDown(0.25);
		write([{ text: text.headline, weight: "semibold", size: 10.5, color: COLOR.accent }], { width: nameWidth });
		doc.y = Math.max(doc.y, contactBottom);

		// Summary
		if (text.summary) {
			section(text.labels.summary);
			write([{ text: text.summary }]);
		}

		if (text.education.length) {
			section(text.labels.education);
			entries(text.education);
		}

		if (text.experience.length) {
			section(text.labels.experience);
			entries(text.experience);
		}

		// Projects: the names in resume.projects, or every project newest first.
		const chosen = resume.projects.length
			? resume.projects.flatMap((name) => projects.filter((project) => project.name === name))
			: [...projects].sort((a, b) => projectEnd(b.year) - projectEnd(a.year));
		if (chosen.length) {
			section(text.labels.projects);
			for (const project of chosen) {
				const own = text.projects[project.name] ?? {};
				const link = project.code ?? project.demo;
				entryHeader(project.name, own.kind ?? project.kind, formatDate(project.year, text.dateLocale, text.labels.present));
				write([{ text: own.description ?? project.description }]);
				doc.moveDown(0.1);
				write([
					{ text: project.tags.join("  ·  "), size: 8.5, color: COLOR.muted },
					...(link ? [{ text: `     ${withoutProtocol(link)}`, size: 8.5, color: COLOR.accent, link }] : []),
				]);
				doc.moveDown(0.6);
			}
		}

		// Skills: the group name on the left, the skills on the right.
		if (resume.skills.length) {
			section(text.labels.skills);
			const labelWidth = 148;
			for (const { group, items } of resume.skills) {
				keep(24);
				const y = doc.y;
				write([{ text: text.skillGroups[group] ?? group, weight: "semibold", size: 9.2, color: COLOR.ink }], {
					x: left,
					y,
					width: labelWidth - 10,
				});
				const labelBottom = doc.y;
				write([{ text: items.join(", "), size: 9.2 }], { x: left + labelWidth, y, width: width - labelWidth });
				doc.y = Math.max(doc.y, labelBottom) + 2;
			}
		}

		doc.end();
	});
