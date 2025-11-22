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

    // Check if CocoaPods is installed (required for iOS development)
    checkCocoaPods();

    // Ensure peer dependencies + required dev dependencies
    if (options.checkPeerDependencies) {
      await ensurePeerDependencies(mainPackage, projectPackage, projectRoot);

      // Reload project package after installs
      projectPackage = jetpack.read(path.join(projectRoot, 'package.json'), 'json');
    }

    // Initialize React Native project if needed
    await ensureReactNativeProject(mainPackage, projectRoot);

    // Sync dependencies from root to dist
    const syncResult = await syncDependenciesToDist(projectRoot);

    // Install iOS pods (only if new dependencies were installed)
    await installPods(projectRoot, syncResult);

    // Clean up unwanted files from dist
    cleanDistFiles(projectRoot);

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

function checkCocoaPods() {
  try {
    execSync('which pod', { stdio: 'pipe' });
    logger.log('CocoaPods is installed');
  } catch (error) {
    logger.error('CocoaPods is required but not installed.');
    logger.error('Install it with: sudo gem install cocoapods');
    throw new Error('CocoaPods not found. Please install CocoaPods to continue.');
  }
}

async function ensureReactNativeProject(mainPackage, projectRoot) {
  const distDir = path.join(projectRoot, 'dist');

  // Check if React Native project already exists (check for dist/ios and dist/android)
  if (jetpack.exists(path.join(distDir, 'ios')) && jetpack.exists(path.join(distDir, 'android'))) {
    logger.log('React Native project already initialized');
    return;
  }

  logger.log('React Native project not found, initializing...');

  try {
    // Get project name from package.json
    const projectPackage = jetpack.read(path.join(projectRoot, 'package.json'), 'json');
    const projectName = projectPackage.name || 'MyApp';

    logger.log(`Initializing React Native project: ${projectName}`);

    // Run React Native init in the dist directory
    execSync(`npx @react-native-community/cli@${mainPackage.engines.react} init --directory ${distDir} --install-pods`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    logger.log('React Native project initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize React Native project:', error);
    throw error;
  }
}

function cleanDistFiles(projectRoot) {
  const distDir = path.join(projectRoot, 'dist');

  // List of files to remove from dist directory
  const filesToRemove = [
    'tsconfig.json',
  ];

  filesToRemove.forEach((file) => {
    const filePath = path.join(distDir, file);
    if (jetpack.exists(filePath)) {
      jetpack.remove(filePath);
      logger.log(`Removed unwanted file: dist/${file}`);
    }
  });
}

async function syncDependenciesToDist(projectRoot) {
  // Use the sync function from distribute task
  const { syncDependenciesToDist } = require('../gulp/tasks/distribute.js');
  return await syncDependenciesToDist();
}

async function installPods(projectRoot, syncResult) {
  const iosDir = path.join(projectRoot, 'dist', 'ios');

  if (!jetpack.exists(iosDir)) {
    logger.log('iOS directory not found, skipping pod install');
    return;
  }

  // Only run pod install if new dependencies were installed
  if (syncResult && syncResult.newDepsInstalled) {
    logger.log('New dependencies detected, installing CocoaPods dependencies...');

    try {
      execSync('pod install', {
        stdio: 'inherit',
        cwd: iosDir,
      });
      logger.log('CocoaPods dependencies installed successfully');
    } catch (error) {
      logger.error('Failed to install CocoaPods dependencies:', error);
      throw error;
    }
  } else {
    logger.log('No new dependencies detected, skipping pod install');
  }
}
