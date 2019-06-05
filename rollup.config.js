import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: 'bin/home.js',
    output: {
      file: 'dist/home.js',
      format: 'iife',
      name: 'brickception'
    },
    plugins: [resolve(), terser()]
  },
  {
    input: 'bin/app.js',
    output: {
      file: 'dist/app.js',
      format: 'iife',
      name: 'brickception'
    },
    plugins: [resolve(), terser()]
  }
];