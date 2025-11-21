const Manager = require('../../build.js');
const logger = Manager.logger('serve');
const { series } = require('gulp');
const WebSocket = require('ws');

let wss = null;

function serve(complete) {
  if (Manager.isBuildMode()) {
    logger.log('Skipping in build mode');
    complete();
    return;
  }

  const port = Manager.getLiveReloadPort();

  logger.log(`Starting WebSocket server on port ${port}...`);

  wss = new WebSocket.Server({ port });

  wss.on('connection', (ws) => {
    logger.log('Client connected');

    ws.on('message', (message) => {
      logger.log('Received:', message.toString());
    });

    ws.on('close', () => {
      logger.log('Client disconnected');
    });
  });

  wss.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });

  // Store reference globally
  global.websocket = wss;

  logger.log('WebSocket server started');
  complete();
}

function serveWatcher(complete) {
  // No watcher needed for serve
  complete();
}

module.exports = series(serve, serveWatcher);
