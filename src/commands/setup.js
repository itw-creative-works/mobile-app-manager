const Manager = require('../build.js');
const logger = Manager.logger('setup');
const jetpack = require('fs-jetpack');
const path = require('path');
const { execSync } = require('child_process');

// Dependency MAP - specifies which dependencies go in devDependencies
const DEPENDENCY_MAP = {
  'gulp': 'dev',
  '@react-native-community/cli': 'dev',
};

module.exports = async function (options) {
  options = options || {};
  options.checkManager = options.checkManager !== false;
  options.checkNode = options.checkNode !== false;
  options.checkPeerDependencies = options.checkPeerDependencies !== false;
  options.setupScripts = options.setupScripts !== false;
  options.checkLocality = options.checkLocality !== false;

  const mainPackage = Manager.getPackage('main');
  let projectPackage = Manager.getPackage('project');
  const projectRoot = Manager.getRootPath('project');

  logger.log(`Welcome to ${mainPackage.name} v${mainPackage.version}!`);

  try {
    // Log current working directory
    logger.log('Current working directory:', process.cwd());

    // Check Node version
    if (options.checkNode) {
      const nodeVersion = process.version;
      logger.log(`Node version: ${nodeVersion}`);
    }

    // Ensure peer dependencies + required dev dependencies
    if (options.checkPeerDependencies) {
      await ensurePeerDependencies(mainPackage, projectPackage, projectRoot);

      // Reload project package after installs
      projectPackage = jetpack.read(path.join(projectRoot, 'package.json'), 'json');
    }

    // Initialize React Native project if needed
    await ensureReactNativeProject(projectRoot);

    // Setup scripts
    if (options.setupScripts) {
      setupScripts(mainPackage, projectPackage, projectRoot);
    }

    // Check locality
    if (options.checkLocality) {
      checkLocality(mainPackage, projectPackage);
    }

    logger.log('Setup complete!');
  } catch (error) {
    logger.error('Setup failed:', error);
    process.exit(1);
  }
};

async function ensurePeerDependencies(mainPackage, projectPackage, projectRoot) {
  const peerDeps = mainPackage.peerDependencies || {};

  // Add required dev dependencies that aren't in peerDependencies
  const requiredDeps = {
    ...peerDeps,
  };

  projectPackage.dependencies = projectPackage.dependencies || {};
  projectPackage.devDependencies = projectPackage.devDependencies || {};

  const missingDeps = [];
  const missingDevDeps = [];

  Object.keys(requiredDeps).forEach((dep) => {
    const isDev = DEPENDENCY_MAP[dep] === 'dev';
    const installedVersion = projectPackage.dependencies[dep] || projectPackage.devDependencies[dep];

    if (!installedVersion) {
      const depWithVersion = `${dep}@${requiredDeps[dep]}`;
      if (isDev) {
        missingDevDeps.push(depWithVersion);
      } else {
        missingDeps.push(depWithVersion);
      }
    }
  });

  if (missingDeps.length > 0) {
    logger.log('Missing peer dependencies:', missingDeps);
    logger.log('Installing peer dependencies...');
    try {
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
      logger.error('Failed to install peer dependencies:', error);
    }
  }

  if (missingDevDeps.length > 0) {
    logger.log('Missing dev dependencies:', missingDevDeps);
    logger.log('Installing dev dependencies...');
    try {
      execSync(`npm install --save-dev ${missingDevDeps.join(' ')}`, { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
      logger.error('Failed to install dev dependencies:', error);
    }
  }
}

function setupScripts(mainPackage, projectPackage, projectRoot) {
  logger.log('Updating package.json scripts...');

  projectPackage.scripts = projectPackage.scripts || {};
  const projectScripts = mainPackage.projectScripts || {};

  Object.keys(projectScripts).forEach((script) => {
    projectPackage.scripts[script] = projectScripts[script];
  });

  jetpack.write(path.join(projectRoot, 'package.json'), projectPackage);
}

function checkLocality(mainPackage, projectPackage) {
  const installedVersion = projectPackage.devDependencies?.[mainPackage.name]
    || projectPackage.dependencies?.[mainPackage.name];

  if (installedVersion && installedVersion.startsWith('file:')) {
    logger.warn(`⚠️⚠️⚠️ You are using the local version of ${mainPackage.name}. This WILL NOT WORK when published. ⚠️⚠️⚠️`);
  }
}

async function ensureReactNativeProject(projectRoot) {
  const srcDir = path.join(projectRoot, 'src');

  // Check if React Native project already exists (check for src/ios and src/android)
  if (jetpack.exists(path.join(srcDir, 'ios')) && jetpack.exists(path.join(srcDir, 'android'))) {
    logger.log('React Native project already initialized');
    return;
  }

  logger.log('React Native project not found, initializing...');

  try {
    // Get project name from package.json
    const projectPackage = jetpack.read(path.join(projectRoot, 'package.json'), 'json');
    const projectName = projectPackage.name || 'MyApp';

    logger.log(`Initializing React Native project: ${projectName}`);

    // Run React Native init in the src directory
    execSync(`npx @react-native-community/cli init --directory ${srcDir} --install-pods`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    logger.log('React Native project initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize React Native project:', error);
    throw error;
  }
}
