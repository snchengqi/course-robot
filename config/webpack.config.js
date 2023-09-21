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
    contentScriptPdfDownload: PATHS.src + '/contentScriptPdfDownload.js',
    contentScriptExam: PATHS.src + '/contentScriptExam.js',
    background: PATHS.src + '/background.js',
    pdf: PATHS.src + '/core/pdf.js',
    exam: PATHS.src + '/core/exam.js',
  },
});

module.exports = config;
