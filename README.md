# kushgupta.dev

Personal portfolio site built with React, Vite, and Tailwind CSS. Showcases projects, photography, and an interactive Snake game easter egg.

**Live:** [kushgupta.dev](https://kushgupta.dev)

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for dev server and builds
- **Tailwind CSS 4** with custom warm espresso/terracotta theme
- **Motion** (Framer Motion) for animations
- **Lucide React** for icons
- **GitHub Pages** with automated deployment via GitHub Actions

## Features

- Dark and light theme toggle with smooth transitions
- Full-screen animated Hero section
- Projects showcase with tech badges and source links
- Photography carousel with infinite marquee scroll and lightbox modal
- Playable retro Snake game embedded in a terminal-styled UI
- Responsive design across all breakpoints

## Development

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove `dist/` directory |

## Project Structure

```
src/
  main.tsx          # React DOM entry point
  App.tsx           # Root layout component
  index.css         # Theme variables, fonts, animations
  utils.ts          # cn() helper for className merging
  components/
    Hero.tsx         # Full-screen animated intro
    Navbar.tsx       # Fixed responsive navigation
    Projects.tsx     # Project cards with tech badges
    SnakeGame.tsx    # Playable retro Snake game
    Photography.tsx  # Photo carousel with lightbox
    Footer.tsx       # Contact section
    ThemeToggle.tsx  # Dark/light mode toggle
```

## Deployment

Push to `main` to trigger automatic deployment via GitHub Actions. The workflow builds the project and deploys the `dist/` folder to GitHub Pages.
