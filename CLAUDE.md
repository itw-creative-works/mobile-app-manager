# Mobile App Manager (MAM) - Claude Code Guide

## Overview
Mobile App Manager (MAM) is a framework for building React Native mobile applications with a streamlined workflow. It follows the same architecture pattern as Browser Extension Manager (BEM), providing a familiar development experience.

## Project Structure

When working with a MAM project, you'll encounter this directory structure:

```
project/
├── src/                    # YOUR EDITABLE SOURCE FILES
│   ├── App.tsx            # Main app component (edit this!)
│   ├── index.js           # App entry point (edit this!)
│   └── __tests__/         # Tests
├── dist/                   # REACT NATIVE PROJECT (managed by MAM)
│   ├── ios/               # iOS native code (DO NOT EDIT)
│   ├── android/           # Android native code (DO NOT EDIT)
│   ├── node_modules/      # Dependencies (DO NOT EDIT)
│   ├── App.tsx            # Compiled from src/App.tsx
│   ├── index.js           # Compiled from src/index.js
│   └── [config files]     # React Native configs (DO NOT EDIT)
├── config/
│   └── mobile-app-manager.json  # Project configuration
└── package.json           # Project dependencies
```

## Where to Edit Files

### ✅ EDIT THESE:
- **`src/App.tsx`** - Your main React Native app component
- **`src/index.js`** - App entry point (rarely needs changes)
- **`src/**/*.tsx`** - Any additional React Native components you create
- **`src/**/*.ts`** - TypeScript utility files, types, etc.
- **`config/mobile-app-manager.json`** - App configuration (name, branding, etc.)

### ❌ DO NOT EDIT THESE:
- **`dist/`** - This entire directory is managed by React Native and MAM's build system
- **`dist/ios/`** - Generated iOS native code
- **`dist/android/`** - Generated Android native code
- **`dist/node_modules/`** - Installed dependencies
- Any compiled files in `dist/` that have source files in `src/`

## How MAM Works

### Build Pipeline
1. **Source files** (`src/`) → You edit these
2. **Build process** (gulp) → Compiles src/ to dist/
3. **React Native** (`dist/`) → Runs the compiled code

### Key Commands
```bash
npm run setup     # Initialize the project (installs dependencies, creates React Native project)
npm run gulp      # Build and watch for changes
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run clean     # Clean build artifacts (preserves dist/ React Native files)
```

## Working with React Native

### Importing React Native Components
Even though you edit files in `src/`, you can import and use ANY React Native component or library:

```tsx
// src/App.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World!</Text>
      <Button title="Press Me" onPress={() => alert('Pressed!')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
```

### Installing New Dependencies
**IMPORTANT**: Always install dependencies at the **root level** of your project, not in `dist/`:

```bash
# Install at the root level (MAM will automatically sync to dist/)
npm install <package-name>

# MAM automatically runs pod install during setup
# But if you need to run it manually for native dependencies:
npm run setup
```

**How it works:**
- MAM automatically watches your root `package.json` for changes
- When you install a package at the root, MAM syncs it to `dist/package.json`
- MAM then runs `npm install` in `dist/` automatically
- You never need to manually manage `dist/package.json` or `dist/node_modules/`

**Dependencies NOT synced to dist:**
- `mobile-app-manager` itself (build tool)
- Any packages listed in MAM's `peerDependencies` (like `gulp`)

## Configuration

### App Name & Branding
Edit `config/mobile-app-manager.json`:

```json
{
  "brand": {
    "name": "My Cool App"
  }
}
```

This automatically updates:
- `dist/app.json` name: "MyCoolApp" (spaces removed)
- `dist/app.json` displayName: "My Cool App" (as-is)

## Development Workflow

### 1. Initial Setup
```bash
npm run setup
```
This:
- Installs dependencies
- Runs `react-native init` in `dist/`
- Copies default files from MAM to your project
- Installs CocoaPods for iOS

### 2. Development
```bash
npm run gulp  # Start build watcher (in one terminal)
npm run ios   # Run iOS app (in another terminal)
```

The gulp watcher will automatically:
- Copy changes from `src/` to `dist/`
- React Native Metro bundler will hot-reload your changes

### 3. Making Changes
1. Edit `src/App.tsx` or other files in `src/`
2. Gulp automatically copies to `dist/`
3. React Native hot-reloads the app
4. See your changes instantly!

## Best Practices

### ✅ DO:
- Edit all your code in `src/`
- Import any React Native or npm packages normally
- Use TypeScript (.tsx, .ts files)
- Create new components in `src/components/`
- Add utilities in `src/utils/`
- Write tests in `src/__tests__/`

### ❌ DON'T:
- Edit files in `dist/` (they'll be overwritten)
- Modify `dist/ios/` or `dist/android/` (unless you know what you're doing with native code)
- Run `react-native init` manually (MAM handles this)
- Clean the `dist/` directory manually (use `npm run clean`)

## Troubleshooting

### "react-native: command not found"
The React Native CLI is installed in `dist/node_modules/`. MAM automatically uses the correct path.

### Metro bundler port conflict
If port 8081 is in use:
```bash
lsof -i :8081          # Find the process
kill <PID>             # Kill it
```

### iOS Simulator not available
Download iOS runtimes in Xcode → Settings → Platforms

### Changes not appearing
1. Make sure `npm run gulp` is running
2. Check that you're editing files in `src/`, not `dist/`
3. Try restarting the Metro bundler

## Summary for Claude Code

When assisting with MAM projects:
1. **Always edit files in `src/`**, never in `dist/`
2. Import React Native components normally - they're available even though you're in `src/`
3. The build system automatically compiles `src/` → `dist/`
4. React Native runs from `dist/`, but you never edit there
5. **Install packages at the root level** - MAM automatically syncs them to `dist/`
6. Use `config/mobile-app-manager.json` for app configuration
