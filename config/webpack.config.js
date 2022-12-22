'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    contentScriptSpecial: PATHS.src + '/contentScriptSpecial.js',
    contentScriptCourse: PATHS.src + '/contentScriptCourse.js',
    background: PATHS.src + '/background.js',
  },
});

module.exports = config;
