# Tidy Imports

A VS Code extension that automatically removes unused imports from your JavaScript, TypeScript, and React files.

## Problem

Import statements accumulate over time during development, leaving unused imports that clutter your codebase and impact readability.

## How It Works

1. Scans your workspace for supported file types
2. Analyzes each file to identify unused imports
3. Removes only the unused import statements
4. Preserves all other code unchanged

## Supported File Types

- `.js` - JavaScript
- `.jsx` - JavaScript React
- `.ts` - TypeScript  
- `.tsx` - TypeScript React

## Usage

Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run:

```
Tidy Imports: Remove Unused Imports
```

## Behavior

- **Confirmation**: Shows the number of files that will be processed and asks for confirmation
- **Scope**: Operates on your entire workspace
- **Safety**: Only removes import statements, never touches your business logic
- **Feedback**: Provides progress updates and completion summary

## Limitations

- Static analysis only (doesn't handle dynamic imports)
- Complex import patterns may not be detected
- Always review changes before committing

## Requirements

- VS Code 1.74.0 or higher

---

*Keep your imports clean, keep your code readable.*