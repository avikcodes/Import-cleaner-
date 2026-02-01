```markdown
# Tidy Imports

> Automatically remove unused imports from your JavaScript and TypeScript files.

## What It Does

Scans your project and removes import statements you're not actually using - making your code cleaner and your bundles smaller.

## Features

- 🧹 One-click cleanup for entire project
- ⚡ Fast scanning using TypeScript compiler
- 👀 Preview before removing
- ✅ Supports JavaScript & TypeScript
- 🎯 Safe - only removes truly unused imports

## Usage

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Tidy Imports: Clean Project"
3. Review unused imports
4. Click "Remove All" or select specific files
5. Done!

## Example

**Before:**
```javascript
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import lodash from 'lodash';

function App() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

**After:**
```javascript
import React from 'react';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

## Installation

```bash
# Install from VS Code Marketplace
ext install tidy-imports
```

Or search "Tidy Imports" in VS Code Extensions.

## Requirements

- VS Code 1.85.0 or higher
- Node.js project with JavaScript/TypeScript files

## Tech Stack

- TypeScript
- VS Code Extension API
- TypeScript Compiler API
- Fast-glob for file scanning

## Roadmap

- [x] JavaScript & TypeScript support
- [ ] Python support
- [ ] Go support
- [ ] Auto-cleanup on save option
- [ ] CI/CD integration

## License

MIT

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Made with ❤️ for developers who hate messy imports**
```
