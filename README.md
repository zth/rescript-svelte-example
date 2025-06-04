# ReScript + Svelte PoC

This PoC adds support for `<script lang="res">` to Svelte. There are plenty of things to fix/issues that need to be addressed for this to work out well in practice, but the base building blocks work, as in you can put ReScript code in `<script lang="res">` and have it compiled properly.

Please refer to [rescriptPreprocess.js](support/rescriptPreprocess.js) for the actual code, and for notes about what's missing + limitations.

## Developing

```bash
npm install

# Run ReScript compiler in watch mode separately. This is for the non-`.svelte` ReScript code.
npm run res:watch

# Run the regular Svelte dev process
npm run dev
```
