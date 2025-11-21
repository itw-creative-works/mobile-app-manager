const Manager = require('../build');

module.exports = function () {
  const mainPackage = Manager.getPackage('main');
  console.log(`mobile-app-manager v${mainPackage.version}`);
};
