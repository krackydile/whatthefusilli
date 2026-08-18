# What The Fusilli

A small site that decides what pasta shape you're having today, and explains how each
shape is actually manufactured — the die that produces it, why it's extruded or rolled
or formed by hand.

Live at **[whatthefusilli.com](https://whatthefusilli.com)**.

## What's here

| Page | What it does |
|---|---|
| `index.html` | Picks a shape on load. Reroll button, plus mood filters that narrow the pool. |
| `browse.html` | All 49 shapes grouped into six families, with search and family filters. |
| `shape.html?id=…` | One shape: pronunciation, region, sauce pairings, how it's made, its die. |

No framework and no build step — open `index.html` in a browser and it works.

## Editing

Everything about the pasta lives in [`js/data.js`](js/data.js), one object per shape:

```js
{
  id: 'bucatini',
  name: 'Bucatini',
  cat: 'long',          // long | ribbon | tube | shape | small | filled
  method: 'extruded',   // extruded | rolled | hand | stamped
  icon: 'strand-hollow',// key in js/icons.js
  sauces: ['chunky', 'meaty', 'cheesy'],
  made: '…', die: '…', fact: '…'
}
```

Add an entry and it appears on every page automatically. The `icon` must match a key in
[`js/icons.js`](js/icons.js), which holds a hand-built SVG for each shape and recolors
itself for light and dark mode.

## The shareable single-file build

`node build.js` inlines the CSS and JS into `dist/index.html` — the whole site as one
self-contained page, with the page links converted to hash routes. Used for sharing the
site as a single file; the site deployed here is the multi-page version.
