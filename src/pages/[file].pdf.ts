import type { APIRoute, GetStaticPaths } from 'astro';
import type { ResumeLang } from '../data/resume';
import { site } from '../data/site';
import { resumePdf } from '../lib/resume-pdf';

// One résumé PDF per language in site.resume, at the path given there.
export const getStaticPaths = (() =>
	Object.entries(site.resume).map(([lang, path]) => ({
		params: { file: path.replace(/^\/|\.pdf$/g, '') },
		props: { lang: lang as ResumeLang },
	}))) satisfies GetStaticPaths;

// "inline" opens the PDF in the browser instead of downloading it. Only the dev server sends this
// header; GitHub Pages sends PDFs the same way on its own.
export const GET: APIRoute = async ({ params, props }) =>
	new Response(new Uint8Array(await resumePdf(props.lang)), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${params.file}.pdf"`,
		},
	});
