# Pulkit Tiwari | Personal Portfolio v3

A modern, dynamic professional portfolio showcasing software engineering expertise, live GitHub projects, recent coding activity, and a quantified career journey.

**Live site**: https://pulkittiwari.vercel.app/

## 🚀 Key Features

- **Live GitHub projects**: Repositories are fetched at runtime from the main profile `@PulkitTiwari87`. A project opens its deployed site when the repo has a GitHub homepage set, otherwise its repository.
- **Flagship filter**: Shows hand-picked repos (SOAR, GDriveX), any SOAR variant, and any repo with a live site.
- **Secondary profile hidden by default**: Repos from `@PulkitTiwari51` are not listed unless whitelisted in `SECONDARY_FEATURED` (`src/data/repos.ts`).
- **Last-30-days activity**: GitHub and LeetCode heatmaps with totals, active days and streaks. Results are cached in `sessionStorage` for 15 minutes.
- **Designs menu**: The sidebar has a Designs menu that switches to alternative page designs via hash routes (see below).
- **Dark / light mode**: Toggle in the sidebar; the choice is remembered in `localStorage`.
- **Quantified experience**: Career milestones with measurable achievements, shared across all designs.
- **Contact form**: Submissions go through Web3Forms, plus a social hub.
- **Résumé**: `public/Pulkit_Tiwari_SDE.pdf` is linked from the site.

### Designs

| Design | Route | What it is |
| --- | --- | --- |
| Default | `#/` (no hash) | The main single-page portfolio with the sidebar navigation |
| Apple | `#/designs/apple` | Apple-style typography-led layout (port of a Stitch design) |
| Frame | `#/designs/frame` | Bold editorial layout with CSS-variable theming |
| NERD | `#/designs/nerd` | In progress: the route and menu entry are wired up, but the component (`src/components/NerdDesign.tsx`) is not in the repo yet |

The Apple and Frame designs reuse the shared data in `src/data/`; the Apple design also embeds the Activity section.

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript 5.8, Vite 7 (SWC)
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`)
- **Animation**: Framer Motion 12, GSAP 3
- **UI helpers**: lucide-react, react-icons, react-scroll, SweetAlert2, lightswind
- **Data**: GitHub REST API, jogruber GitHub contributions API, LeetCode GraphQL
- **Fonts**: Inter, Anton, JetBrains Mono, Instrument Serif (Google Fonts)

## 📂 Project Structure

```text
src/
  App.tsx            Layout, theme state, hash routing to the alternative designs
  components/        Sections (Hero, Aboutme, Technologies, GitHubProjects, Activity,
                     Experience, Contact), Bar (sidebar + Designs menu),
                     AppleDesign, FrameDesign, ui/ (visual effects)
  data/              Shared content: experience.ts, repos.ts (repo metadata and
                     flagship rules), roles.ts (role-based intro text)
  utils/             github.ts (repo fetching), activity.ts (30-day GitHub + LeetCode data)
public/              Static files, including the résumé PDF
vite.config.ts       Vite config and the /api/leetcode dev/preview proxy
vercel.json          Production rewrite for /api/leetcode
```

## 📦 Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/PulkitTiwari87/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the contact form** (optional): create a `.env` file with your Web3Forms access key:
   ```bash
   VITE_WEB3FORMS_ACCESS_KEY=your-key-here
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```

Other scripts:

```bash
npm run build     # type-check (tsc -b) and production build to dist/
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

### LeetCode proxy

LeetCode's GraphQL endpoint sends no CORS headers, so the browser calls the same-origin path `/api/leetcode`. It is forwarded to `https://leetcode.com/graphql` by:

- the Vite proxy in `vite.config.ts` (used by `npm run dev` and `npm run preview`), or
- the rewrite in `vercel.json` (production on Vercel).

Serving `dist/` from any other static host will not provide this path, and the LeetCode graph will show its error state unless you add an equivalent rewrite.

## 🔗 Data Sources & Credits

- **GitHub REST API**: project list (`api.github.com`) and the public-events fallback for the activity graph.
- **GitHub contributions API by jogruber** (`github-contributions-api.jogruber.de`): primary source for the GitHub heatmap.
- **LeetCode GraphQL**: submission calendar and solved counts for `pulkittiwari51`.
- **Stitch**: the Apple design and the Activity section are ports of Stitch-generated design references.
- Inspiration sites were used only as layout and effect references; no content or assets are copied from them.

## 🌐 Deployment

The site is deployed on **Vercel** (https://pulkittiwari.vercel.app/), using `vercel.json` for the LeetCode rewrite. Set `VITE_WEB3FORMS_ACCESS_KEY` in the Vercel project's environment variables for the contact form.

`package.json` still contains the older GitHub Pages scripts (`predeploy` and `deploy`, which run `gh-pages -d dist`). They are not part of the current Vercel flow.

## 📄 License
© 2026 Pulkit Tiwari. All rights reserved.
