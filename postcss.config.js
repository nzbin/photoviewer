const pkg = require('./package.json');

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

module.exports = ctx => ({
  map: ctx.options.map,
  plugins: {
    'postcss-header': {
      header: banner,
    },
    'autoprefixer': {
      cascade: false,
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    },
    cssnano: ctx.env === 'production' ? {} : false
  }
})
