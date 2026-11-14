// Draws the résumé PDF from src/data/resume.ts. Edit the data there; this file is only the layout.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as fontkit from "fontkit";
import PDFDocument from "pdfkit";
import { resume, type ResumeEntry, type ResumeLang } from "../data/resume";
import { projectEnd, projects, projectTime } from "../data/site";

const PAGE = { size: "A4", marginX: 50, marginY: 36 } as const;

// Body text size in points.
const BODY = 9.3;

const COLOR = {
	ink: "#15151f",
	text: "#2d2d35",
	muted: "#62626f",
	rule: "#8f909a",
};

// Fonts are tried in order for each character: Manrope (the site's font) for Latin text,
// Noto Sans Thai for Thai, and Noto Sans Math for symbols like ∇.
const STACK = {
	regular: ["Manrope-Regular", "NotoSansThai-Regular", "NotoSansMath-Regular"],
	semibold: ["Manrope-SemiBold", "NotoSansThai-SemiBold", "NotoSansMath-Regular"],
	bold: ["Manrope-Bold", "NotoSansThai-Bold", "NotoSansMath-Regular"],
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

const MONTH_DATE = /^(\d{1,2}\s+)?([a-z]{3})[a-z]*\s+(\d{4})$/i;

const formatMonth = (date: string, locale: string) => {
	const match = date.match(MONTH_DATE);
	if (!match) return date;
	return new Intl.DateTimeFormat(locale, {
		day: match[1] ? "numeric" : undefined,
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(projectTime(date));
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
				Title: `${text.name}; ${text.labels.title}`,
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

		// A line across the page, then the title under it. Latin titles are capitals with wide letter
		// spacing. Thai titles stay unspaced, since spacing pulls the marks off their letters.
		const section = (title: string) => {
			keep(70);
			doc.moveDown(0.45);
			const y = doc.y;
			doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).strokeColor(COLOR.rule).stroke();
			const thai = THAI.test(title);
			write([{ text: title.toUpperCase(), weight: "bold", size: thai ? 10 : 9, color: COLOR.ink }], {
				x: left,
				y: y + 9,
				characterSpacing: thai ? 0 : 1.1,
			});
			doc.y += 3;
		};

		// The title on the left and the date on the right, both bold, with the subtitle on the next line.
		const entryHeader = (title: string, subtitle: string, when: string) => {
			keep(40);
			const y = doc.y;
			const date: Part[] = [{ text: when, weight: "semibold", size: 9.2, color: COLOR.ink }];
			const dateWidth = when ? measure(date) : 0;
			if (when) write(date, { x: right - dateWidth, y: y + 1, width: dateWidth + 2 });
			const dateBottom = doc.y;
			write([{ text: title, weight: "bold", size: 10.2, color: COLOR.ink }], { x: left, y, width: width - dateWidth - 16 });
			doc.y = Math.max(doc.y, dateBottom);
			if (subtitle) write([{ text: subtitle, weight: "semibold", size: 9.2 }]);
			doc.y += 1.5;
		};

		const bullets = (points: string[]) => {
			for (const point of points) {
				// A point that crossed the page end would leave its dot behind on the old page.
				keep(32);
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

		// Header: the name, then the headline, then the location and links on a line under them.
		// The name shrinks to stay on one line.
		const name: Part = { text: text.name, weight: "bold", size: 26, color: COLOR.ink };
		name.size = Math.min(26, (26 * width) / measure([name]));
		write([name], { x: left, y: PAGE.marginY });
		if (text.aka) write([{ text: `${text.labels.aka} ${text.aka}`, size: 9.5, color: COLOR.muted }]);
		write([{ text: text.headline, weight: "semibold", size: 10.5, color: COLOR.ink }]);
		doc.moveDown(0.3);
		const dot: Part = { text: "   ·   ", size: 8.8, color: COLOR.muted };
		const contact: Part[] = [
			...(text.location ? [{ text: text.location, size: 8.8 }] : []),
			...resume.links.filter(Boolean).map((link) => ({ text: withoutProtocol(link), link, size: 8.8 })),
		];
		// A link moves to the next line whole, so it never breaks in the middle.
		let line: Part[] = [];
		for (const part of contact) {
			if (line.length && measure([...line, dot, part]) > width) {
				write(line);
				line = [];
			}
			line.push(...(line.length ? [dot] : []), part);
		}
		if (line.length) write(line);

		// Core skills come first, one column per list in resume.coreSkills.
		if (resume.coreSkills.length) {
			section(text.labels.skills);
			const columns = resume.coreSkills.length;
			const top = doc.y;
			resume.coreSkills.forEach((column, c) =>
				column.forEach((skill, r) =>
					write([{ text: skill, weight: "semibold", size: 9.8, color: COLOR.ink }], {
						x: left + (c * width) / columns,
						y: top + r * 15,
						width: width / columns - 8,
					}),
				),
			);
			doc.y = top + Math.max(...resume.coreSkills.map((column) => column.length)) * 15;
		}

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
				if (own.points?.length) bullets(own.points);
				else write([{ text: own.description ?? project.description }]);
				doc.moveDown(0.1);
				write([
					{ text: project.tags.join("  ·  "), size: 8.5, color: COLOR.muted },
					...(link ? [{ text: `     ${withoutProtocol(link)}`, size: 8.5, color: COLOR.ink, link }] : []),
				]);
				doc.moveDown(0.45);
			}
		}

		doc.end();
	});
