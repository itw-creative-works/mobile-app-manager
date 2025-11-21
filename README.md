# Mobile App Manager

Cross-platform mobile app framework for easy React Native development, inspired by [browser-extension-manager](https://github.com/ITW-Creative-Works/browser-extension-manager).

## Features

- **Easy Setup**: Simple CLI commands to get started
- **Automated Builds**: Gulp-based build system handles all compilation, bundling, and asset management
- **Live Reload**: Automatic reload on file changes during development
- **Template Replacement**: Dynamic configuration injection into your code
- **Production Builds**: One command to build production-ready apps
- **Cross-Platform**: Support for both iOS and Android

## Installation

```bash
npm install mobile-app-manager
```

## Quick Start

### 1. Create a New Project

```bash
mkdir my-mobile-app
cd my-mobile-app
npm init -y
npm install mobile-app-manager gulp
```

### 2. Initialize the Project

```bash
npx mam setup
```

This will:
- Copy default configuration files
- Set up the project structure
- Install required dependencies
- Add npm scripts to your package.json

### 3. Start Development

```bash
npm start
```

This will:
- Clean build artifacts
- Copy default templates
- Compile assets (SCSS, JS)
- Start the live reload server
- Watch for file changes

### 4. Run on Device/Emulator

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### 5. Build for Production

```bash
npm run build
```

## Project Structure

After running `npx mam setup`, your project will have this structure:

```
my-mobile-app/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   └── screens/
│   │   │       └── home/
│   │   │           └── index.scss
│   │   ├── js/
│   │   │   └── screens/
│   │   │       └── home/
│   │   │           └── index.js
│   │   └── images/
│   ├── screens/
│   │   └── home/
│   │       └── index.js
│   └── config/
│       └── mobile-app-manager.json
├── dist/              # Compiled files (gitignored)
├── packaged/          # Final build output (gitignored)
├── hooks/             # Build hooks
│   ├── build:pre.js
│   └── build:post.js
├── App.js
├── index.js
├── app.json
└── package.json
```

## Configuration

Edit `config/mobile-app-manager.json` to configure your app:

```json
{
  "app": {
    "id": "my-app",
    "name": "My App"
  },
  "brand": {
    "name": "My App",
    "url": "https://example.com",
    "contact": {
      "email": "support@example.com"
    },
    "images": {
      "icon": "./src/assets/images/icon.png",
      "splash": "./src/assets/images/splash.png"
    }
  },
  "metroPort": 8081,
  "liveReloadPort": 35729,
  "firebaseConfig": {
    "apiKey": "...",
    "projectId": "..."
  }
}
```

## Template Replacement

You can use template markers in your JavaScript code that will be replaced during the build:

```javascript
const version = '%%% version %%%';
const environment = '%%% environment %%%';
const config = %%% managerConfiguration %%%;
const appConfig = %%% appConfiguration %%%;
```

Available markers:
- `%%% version %%%` - Package version
- `%%% environment %%%` - 'production' or 'development'
- `%%% liveReloadPort %%%` - WebSocket port for live reload
- `%%% metroPort %%%` - Metro bundler port
- `%%% appConfiguration %%%` - app.json contents
- `%%% managerConfiguration %%%` - mobile-app-manager.json contents

## Build Hooks

Create hooks to run custom code during the build process:

**hooks/build:pre.js**
```javascript
module.exports = async function (buildMetadata) {
  console.log('Running pre-build hook');
  console.log('Version:', buildMetadata.version);
  // Your custom logic here
};
```

**hooks/build:post.js**
```javascript
module.exports = async function (buildMetadata) {
  console.log('Running post-build hook');
  // Your custom logic here
};
```

## CLI Commands

- `npx mam setup` - Initialize/update mobile-app-manager in your project
- `npx mam clean` - Clean build artifacts
- `npx mam ios` - Run iOS app
- `npx mam android` - Run Android app
- `npx mam version` - Show version

## NPM Scripts

After setup, these scripts will be available:

- `npm start` - Start development with live reload
- `npm run build` - Build for production
- `npm run ios` - Run on iOS
- `npm run android` - Run on Android
- `npm run gulp -- [task]` - Run specific gulp task

## How It Works

Mobile App Manager follows a two-tier architecture:

1. **Framework Layer** (this package)
   - Core build system and gulp tasks
   - CLI commands
   - Default templates and configurations
   - Manager classes for build orchestration

2. **Project Layer** (your app)
   - App-specific code and screens
   - Configuration overrides
   - Custom assets and styles

The framework handles all the build complexity, letting you focus on your app's functionality.

## Comparison to browser-extension-manager

If you've used [browser-extension-manager](https://github.com/ITW-Creative-Works/browser-extension-manager), you'll find Mobile App Manager very familiar:

- Same gulp-based build system
- Same template replacement system
- Same configuration patterns
- Same hook system
- Similar project structure

The main difference is that Mobile App Manager targets React Native mobile apps instead of browser extensions.

## Development Workflow

1. **Start development**: `npm start`
2. **Make changes** to files in `src/`
3. **Watch automatic rebuild** and reload
4. **Test** on device/emulator with `npm run ios` or `npm run android`
5. **Build for production**: `npm run build`

## License

MIT

## Credits

Created by ITW Creative Works
