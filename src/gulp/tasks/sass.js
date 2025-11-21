const Manager = require('../../build.js');
const logger = Manager.logger('sass');
const { src, dest, watch, series } = require('gulp');
const gulpSass = require('gulp-sass');
const sass = require('sass');
const path = require('path');

const compiler = gulpSass(sass);
const projectRoot = Manager.getRootPath('project');
const delay = 250;

function sassTask(complete) {
  logger.log('Starting...');

  return src(path.join(projectRoot, 'src', 'assets', 'css', 'screens', '**', 'index.scss'))
    .pipe(
      compiler({
        outputStyle: Manager.actLikeProduction() ? 'compressed' : 'expanded',
      }).on('error', (error) => {
        Manager.reportBuildError(error);
        logger.error('SCSS compilation error:', error);
      })
    )
    .pipe(dest(path.join(projectRoot, 'dist', 'assets', 'css', 'screens')))
    .on('finish', () => {
      logger.log('Finished!');
      return complete();
    });
}

function sassWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  watch(
    path.join(projectRoot, 'src', 'assets', 'css', '**', '*.scss'),
    { delay: delay, dot: true },
    sassTask
  ).on('change', (path) => {
    logger.log(`[watcher] File changed (${path})`);
  });

  return complete();
}

module.exports = series(sassTask, sassWatcher);
