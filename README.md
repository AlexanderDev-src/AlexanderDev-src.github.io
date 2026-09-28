# Alexander Sanford — Portfolio

My personal portfolio site. Live at **https://alexanderdev-src.github.io**

It's a single page built with [Astro](https://astro.build), set in space: a canvas starfield with nebula and shooting stars in the background, and a black hole in the hero section that pulls in the logos of the tools I use. The page has four sections below the hero: Projects (each one opens a photo gallery), Skills, About, and Contact.

## Stack

- Astro 7 + TypeScript
- Plain CSS (`src/styles/global.css`), no UI framework
- Canvas 2D for the background and the black hole (`src/scripts/cosmos.ts`)
- Tech icons from [Devicon](https://devicon.dev) (MIT), loaded from jsDelivr
- Deployed to GitHub Pages with GitHub Actions

## Running it locally

You need Node.js 22.12 or newer.

```sh
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # build the site into ./dist
npm run preview   # serve the built site locally
```

## Editing the content

All the text, links, projects, and skills live in one file: `src/data/site.ts`. The components only read from it, so you rarely need to touch them to change what the page says.

| Export | What it controls |
| :-- | :-- |
| `site` | Name, role, status line, email, intro text, and the time zone for the hero clock |
| `nav`, `socials` | Header links and contact links |
| `about` | Portrait path, quote, and bio |
| `projects` | Project cards and their galleries |
| `timeline` | Education entries |
| `skills` | Skill groups and their Devicon ids |
| `cosmos` | Background settings (see below) |

### Adding a project

1. Put the screenshots in `public/projects/<project-name>/`.
2. Add an entry to `projects` in `src/data/site.ts`:

```ts
{
	name: "LexiLog",
	year: "2026",
	kind: "Full-stack web app",
	description: "What it is and what it does.",
	tags: ["Rust", "Svelte"],
	photos: [
		{ src: "/projects/lexilog/1.png", caption: "Today" },
	],
	code: "https://github.com/AlexanderDev-src/lexilog",
	demo: "https://...", // optional
},
```

A project with no photos gets placeholder images and a "not finished yet" note. Set `draft: true` to show the note even when it has photos, and `draftNote` to change its text.

### Background settings

The `cosmos` object in `src/data/site.ts` controls the animation:

- `starDensity` — number of stars, 10 to 150
- `nebulaIntensity` — nebula glow, 0 to 120
- `showBlackHole`, `showOrbitIcons` — turn the black hole or its icons on and off
- `orbitIcons` — which Devicon logos spiral into the black hole, each with a short text fallback

## Project structure

```text
src/
├── components/
│   ├── sections/        Hero, Projects, Skills, About, Contact
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ProjectCard.astro
│   ├── ProjectGallery.astro
│   └── SectionHeading.astro
├── data/site.ts         all page content
├── layouts/Layout.astro
├── pages/index.astro
├── scripts/cosmos.ts    starfield and black hole
└── styles/global.css
public/
└── projects/            project screenshots
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages. You can also start it by hand from the Actions tab. In the repository settings, Pages → Source must be set to **GitHub Actions**.
