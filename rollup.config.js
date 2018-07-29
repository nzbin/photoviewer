import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const banner = `
/*!
 *  ____  _   _  ___  _____  ___  _   _ _____ ____ _    _ ____ ____
 * |  _ \\| | | |/ _ \\|_   _|/ _ \\| | | |_   _|  __| |  | |  __|  _ \\
 * | |_| | |_| | | | | | | | | | | | | | | | | |__| |  | | |__| |_| |
 * |  __/|  _  | | | | | | | | | | |_| | | | |  __| |/\\| |  __|    /
 * | |   | | | | |_| | | | | |_| |\\   / _| |_| |__|  /\\  | |__| |\\ \\
 * |_|   |_| |_|\\___/  |_|  \\___/  \\_/ |_____|____|_/  \\_|____|_| \\_\\
 *
 * ${pkg.name} - v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Copyright (c) 2018 ${pkg.author}
 * Released under ${pkg.license} License
 */
`;


export default [
  {
    input: 'src/js/core.js',
    external: ['jquery'],
    output: [
      {
        name: 'photoviewer',
        banner,
        globals: {
          jquery: 'jQuery',
        },
        file: "dist/photoviewer.js",
        format: 'umd',
        sourcemap: true
      },
      {
        file: 'dist/photoviewer.common.js',
        banner,
        format: 'cjs',
        sourcemap: true

      },
      {
        file: 'dist/photoviewer.esm.js',
        banner,
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      resolve(),
      commonjs(),
    ],
  },
];
