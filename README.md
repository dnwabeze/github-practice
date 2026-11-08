# Lumen — Demo Frontend Website

A responsive demo landing page for **Lumen**, a made-up task-planning app. It's built with plain HTML, CSS and JavaScript: no frameworks, no build step.

## Features

- Responsive layout with a mobile hamburger menu
- Light/dark theme toggle (starts from your system preference and remembers your choice)
- A working **to-do list demo** with add, complete, delete, filter and "clear completed", saved to `localStorage`
- Pricing cards with a monthly/yearly billing toggle
- Animated stat counters and reveal-on-scroll sections
- FAQ accordion using native `<details>`
- Contact form with client-side validation (demo only, nothing gets sent)
- Accessibility basics: semantic markup, keyboard focus styles, ARIA labels, and support for `prefers-reduced-motion`

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File         | Purpose                         |
|--------------|---------------------------------|
| `index.html` | Page structure and content      |
| `styles.css` | Theme tokens, layout, responsive styles |
| `script.js`  | Interactivity (theme, nav, todo, pricing, form) |
