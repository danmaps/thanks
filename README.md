# Thanksgiving Task Optimizer

A React + TypeScript app that optimizes Thanksgiving meal prep tasks using a greedy algorithm.

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

Create a production build:

```bash
npm run build
```

The build output will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Deploy

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy`
3. For production: `netlify deploy --prod`

### Deploy to GitHub Pages

1. Add to `vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
})
```

2. Add to `package.json` scripts:
```json
"deploy": "npm run build && npx gh-pages -d dist"
```

3. Install gh-pages: `npm i -D gh-pages`
4. Run: `npm run deploy`

### Manual Deploy

Build the project and upload the `dist` folder to any static hosting service (AWS S3, Cloudflare Pages, etc.).

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
