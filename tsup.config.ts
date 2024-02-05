import { defineConfig } from 'tsup';
import { name } from './package.json';

export default defineConfig({
    name,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: 'es2017',
    sourcemap: true,
    minify: 'terser',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    dts: true,
})