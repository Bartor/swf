# Simple Web Framework

HTML-first, React-sque, two-paradigm simple and lightweight framework for web development.

## Features

- supports both **static HTML DOM generations** via provided building blocks and **internally-state-managed components with memoization**
- state, memo and effects
- React-like reconciliation for performance

## TODOs

- support `key` prop
- add memo variant for methods like `useCallback`
- add contexts/providers
- add reducers
- update `style` per property
- update test coverage

## Build

### Development

Watch-mode with sourcemaps for development

```bash
npm run dev
```

see example usage in [`usage.html`](./usage.html) and [`usage.js`](./usage.js)

### Production

Bundled for releases

```bash
npm run build
```
