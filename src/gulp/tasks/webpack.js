const Manager = require('../../build.js');
const logger = Manager.logger('webpack');
const { src, dest, watch, series } = require('gulp');
const webpack = require('webpack-stream');
const path = require('path');
const jetpack = require('fs-jetpack');

const projectRoot = Manager.getRootPath('project');
const mainRoot = Manager.getRootPath('main');
const delay = 250;

function webpackTask(complete) {
  logger.log('Starting...');

  const config = Manager.getConfig();
  const appConfig = Manager.getAppConfig();
  const environment = Manager.getEnvironment();
  const pkg = Manager.getPackage('project');

  // Find all screen entry points
  const screensDir = path.join(projectRoot, 'src', 'assets', 'js', 'screens');
  const screens = jetpack.list(screensDir) || [];

  const entries = {};
  screens.forEach((screen) => {
    const indexPath = path.join(screensDir, screen, 'index.js');
    if (jetpack.exists(indexPath)) {
      entries[screen] = indexPath;
    }
  });

  if (Object.keys(entries).length === 0) {
    logger.warn('No screen entry points found');
    complete();
    return;
  }

  // Template replacement
  const replacements = {
    '%%% version %%%': pkg.version || '0.0.1',
    '%%% environment %%%': environment,
    '%%% liveReloadPort %%%': Manager.getLiveReloadPort(),
    '%%% metroPort %%%': Manager.getMetroPort(),
    '%%% appConfiguration %%%': JSON.stringify(appConfig),
    '%%% managerConfiguration %%%': JSON.stringify(config),
  };

  return src(Object.values(entries))
    .pipe(
      webpack({
        mode: environment === 'production' ? 'production' : 'development',
        entry: entries,
        output: {
          filename: '[name].bundle.js',
        },
        module: {
          rules: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    presets: [
                      require.resolve('@babel/preset-env'),
                      require.resolve('@babel/preset-react'),
                      require.resolve('@babel/preset-typescript'),
                    ],
                  },
                },
                {
                  loader: path.join(mainRoot, 'dist', 'lib', 'template-loader.js'),
                  options: replacements,
                },
              ],
            },
          ],
        },
        resolve: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        resolveLoader: {
          modules: [
            path.join(mainRoot, 'node_modules'),
            path.join(projectRoot, 'node_modules'),
            'node_modules',
          ],
        },
        devtool: environment === 'production' ? false : 'source-map',
      }).on('error', (error) => {
        Manager.reportBuildError(error);
        logger.error('Webpack error:', error);
      })
    )
    .pipe(dest(path.join(projectRoot, 'dist', 'assets', 'js', 'screens')))
    .on('finish', () => {
      logger.log('Finished!');
      return complete();
    });
}

function webpackWatcher(complete) {
  if (Manager.isBuildMode()) {
    logger.log('[watcher] Skipping watcher in build mode');
    return complete();
  }

  logger.log('[watcher] Watching for changes...');

  watch(
    path.join(projectRoot, 'src', 'assets', 'js', '**', '*.{js,jsx,ts,tsx}'),
    { delay: delay, dot: true },
    webpackTask
  ).on('change', (path) => {
    logger.log(`[watcher] File changed (${path})`);
  });

  return complete();
}

module.exports = series(webpackTask, webpackWatcher);
