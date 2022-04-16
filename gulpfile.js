var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var banner = require('gulp-banner');
var pkg = require('./package.json');
var flatten = require('gulp-flatten');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefixPlugin = new LessPluginAutoPrefix();
var distTarget = './dist';
var siteStaticTarget = './_site/static';
var docsStaticTarget = './docs/static';
var minifiedFileExtensionName = '.min.css';
var cdnTarget = './_cdn/skin/v' + pkg.version;
var yargs = require('yargs');

var comment = [
    '/*!',
    'Skin v<%= pkg.version %>',
    'Copyright 2017 eBay! Inc. All rights reserved.',
    'Licensed under the BSD License.',
    'https://github.com/eBay/skin/blob/master/LICENSE.txt"',
    '*/\n',
].join('\n');

const excludedFolders = ['bundles', 'gh', 'primitives', 'tokens', 'mixins'];

// use for debug purposes only
const includedFolders = ['badge', 'switch', 'tabs'];

// filter for removing files and folders under src/less that should not be compiled by lessc
const filterSrc = (dirent) => dirent.isDirectory() && !excludedFolders.includes(dirent.name);

async function compileModule(moduleName, moduleDs) {
    const name = yargs.argv.name === undefined ? moduleName : yargs.argv.name;
    const ds = yargs.argv.ds === undefined ? moduleDs : yargs.argv.ds;

    gulp.src([`./src/less/${name}/base/${name}.less`])
        .pipe(less({ plugins: [autoprefixPlugin], globalVars: { ds: ds } }))
        .pipe(gulp.dest(`${distTarget}/${name}/${ds}`));
}

async function compileModules() {
    return fs.readdir(
        path.join(__dirname, 'src/less'),
        { withFileTypes: true },
        function (err, files) {
            const filteredFiles = files.filter(filterSrc);

            filteredFiles.forEach((dirent) => compileModule(dirent.name, 'ds4'));
            filteredFiles.forEach((dirent) => compileModule(dirent.name, 'ds6'));
        }
    );
}

// Compile and minify a full skin bundle to docs/static, _site/static and cdn
async function compileBundle(bundleDs) {
    const ds = yargs.argv.ds === undefined ? bundleDs : yargs.argv.ds;

    gulp.src(['./src/less/bundles/skin/*.less'])
        .pipe(banner(comment, { pkg: pkg }))
        .pipe(rename((path) => (path.extname = minifiedFileExtensionName)))
        .pipe(less({ plugins: [autoprefixPlugin], globalVars: { ds } }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(`${docsStaticTarget}/${ds}`))
        .pipe(gulp.dest(`${siteStaticTarget}/${ds}`))
        .pipe(gulp.dest(`${cdnTarget}/${ds}`));
}

async function compileBundles() {
    compileBundle('ds4');
    compileBundle('ds6');
}

// Static Server + watching src & docs files
function server() {
    // Start the server.
    browserSync.init({ server: '_site' });
    // Watch less files under src/less. Resync CSS on change.
    // TODO: only re-compile modules that changed
    gulp.watch('src/less/**/*.less', gulp.series('default', injectSkinCSS));
    // Watch less files under docs. Resync CSS on change.
    gulp.watch('docs/src/less/**/*.less', syncDocsCss);
    // Watch js files under docs. Resync JS on change.
    gulp.watch('docs/src/js/**/*.js', syncDocsJs);
    // Watch svg files under src. Copy to docs on change.
    gulp.watch('src/svg/*.svg', syncDocsSvg);
    // Watch html files under docs. Regenerate _site on change.
    gulp.watch(['docs/**/*.html', 'docs/**/*.svg'], syncDocsHtml);
    // Watch html & svg files under _site. Resync browser on change.
    gulp.watch(['_site/**/*.html', '_site/**/*.svg']).on('change', browserSync.reload);
}

// Inject Skin CSS into browsers
function injectSkinCSS() {
    return gulp.src(['_site/**/*.css', '_site/**/*.min.css']).pipe(browserSync.stream());
}

// Re-bundle the docs CSS, copy to jekyll _site/static, inject into browsers
function syncDocsCss() {
    return child_process
        .spawn('npm', ['run', 'bundle:css'], { stdio: 'inherit' })
        .on('close', function () {
            gulp.src(['./docs/static/ds4/docs.min.css'])
                .pipe(gulp.dest(siteStaticTarget + '/ds4'))
                .pipe(browserSync.stream());

            gulp.src(['./docs/static/ds6/docs.min.css'])
                .pipe(gulp.dest(siteStaticTarget + '/ds6'))
                .pipe(browserSync.stream());
        });
}

// Re-bundle the docs JS, copy it to jekyll _site/static, then reload browsers
function syncDocsJs() {
    return child_process
        .spawn('npm', ['run', 'bundle:js'], { stdio: 'inherit' })
        .on('close', function () {
            gulp.src(['./docs/static/common/docs.min.js']).pipe(
                gulp.dest(siteStaticTarget + '/common')
            );

            browserSync.reload();
        });
}

// Re-bundle the docs SVG, copy it to /docs
function syncDocsSvg() {
    return child_process.spawn('npm', ['run', 'copy:svgToDocs'], { stdio: 'inherit' });
}

// Run Jekyll build
function syncDocsHtml(cb) {
    return child_process
        .spawn(
            'bundler',
            ['exec', 'jekyll', 'build', '--config', 'docs/_config.yml,docs/_config.localhost.yml'],
            { stdio: 'inherit' }
        )
        .on('close', cb);
}

// public tasks
exports.compileModule = compileModule;
exports.compileModules = compileModules;
exports.compileBundle = compileBundle;
exports.compileBundles = compileBundles;
exports.server = server;
exports.default = gulp.series(gulp.parallel(compileModules, compileBundles));
