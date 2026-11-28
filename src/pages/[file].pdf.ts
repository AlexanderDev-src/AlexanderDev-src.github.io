import type { APIRoute, GetStaticPaths } from 'astro';
import type { DocKind, ResumeLang } from '../data/resume';
import { site } from '../data/site';
import { resumePdf } from '../lib/resume-pdf';

// One PDF per language for the résumé (site.resume) and for the CV (site.cv), at the paths given there.
export const getStaticPaths = (() =>
	(['resume', 'cv'] as const).flatMap((kind) =>
		Object.entries(site[kind]).map(([lang, path]) => ({
			params: { file: path.replace(/^\/|\.pdf$/g, '') },
			props: { lang: lang as ResumeLang, kind: kind as DocKind },
		})),
	)) satisfies GetStaticPaths;

// "inline" opens the PDF in the browser instead of downloading it. Only the dev server sends this
// header; GitHub Pages sends PDFs the same way on its own.
export const GET: APIRoute = async ({ params, props }) =>
	new Response(new Uint8Array(await resumePdf(props.lang, props.kind)), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${params.file}.pdf"`,
		},
	});
