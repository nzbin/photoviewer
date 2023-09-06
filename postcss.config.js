const pkg = require('./package.json');

const banner = String.raw`/*!
 *     ____  __  ______  __________ _    _____________       ____________
 *    / __ \/ / / / __ \/_  __/ __ \ |  / /  _/ ____/ |     / / ____/ __ \
 *   / /_/ / /_/ / / / / / / / / / / | / // // __/  | | /| / / __/ / /_/ /
 *  / ____/ __  / /_/ / / / / /_/ /| |/ // // /___  | |/ |/ / /___/ _, _/
 * /_/   /_/ /_/\____/ /_/  \____/ |___/___/_____/  |__/|__/_____/_/ |_|
 *
 * ${pkg.name} - v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
 *
 * Copyright (c) 2018-present ${pkg.author}
 * Released under ${pkg.license} License
 */
`;

module.exports = ctx => ({
  // map: ctx.options.map,
  plugins: {
    'postcss-header': {
      header: banner
    },
    autoprefixer: {
      cascade: false
    },
    cssnano: ctx.env === 'production' ? {} : false
  }
});
