import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const banner = `/*!
* ${pkg.name} - v${pkg.version}
* ${pkg.description}
* ${pkg.homepage}
*
* Made by ${pkg.author}
* Under ${pkg.license} License
*/`;


export default [
  {
    input: 'src/photoviewer.js',
    external: ['jquery'],
    output: [
      {
        name: 'photoviewer',
        banner,
        globals: {
          jquery: 'jQuery',
        },
        file: pkg.browser,
        format: 'umd',
        sourcemap: true,
      }
    ],
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      resolve(),
      commonjs(),
    ],
  },
];
