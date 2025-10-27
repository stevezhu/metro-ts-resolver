# @stzhu/metro-ts-resolver

A custom Metro resolver that enables `.js` extensions for TypeScript imports in React Native projects.

## The Problem

TypeScript allows the use `.js` extensions in import statements, while the actual files are `.ts` or `.tsx`:

```typescript
// The file is actually Button.tsx, but you import it as .js
import { Button } from './Button.js';
```

Metro's default resolver doesn't support this pattern and tries to resolve to the `.js` file. If you choose to use `.js` extensions in your TypeScript imports, Metro fails to resolve them to the actual `.ts`/`.tsx` files, causing resolution errors.

This package adds support for this pattern by using TypeScript's own module resolution to correctly map `.js` imports to their corresponding TypeScript files.

## Installation

```bash
pnpm add -D @stzhu/metro-ts-resolver
```

## Usage

Update your `metro.config.js` to use the custom resolver:

```javascript
const { createTsResolveRequest } = require('@stzhu/metro-ts-resolver');

const config = {
  /// ...
};

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    resolveRequest: createTsResolveRequest({
      projectDir: __dirname,
      // Optional: specify a custom tsconfig filename
      // tsconfigName: 'tsconfig.json'
    }),
  },
};
```

That's it! Now you can use ESM-style imports in your TypeScript files:

```typescript
// App.tsx
import { Button } from './components/Button.js'; // ✅ Works!
// or
import { Button } from '@workspace/ui/Button.js'; // ✅ Works!
```

## How It Works

When Metro encounters a `.js` import from a TypeScript file, this resolver:

1. Uses TypeScript's module resolution to find the actual file (`.ts`, `.tsx`, etc.)
2. Resolves the import with the correct extension
3. Falls back to Metro's default resolution for all other cases

The resolver respects your `tsconfig.json` configuration, including `paths`, `baseUrl`, and other module resolution settings.

## Requirements

- Metro >= 0.83.0
- TypeScript 5.x

## References

- [Metro Issue #886: ESM TypeScript support in the metro-resolver](https://github.com/facebook/metro/issues/886#issuecomment-3452291436)
- [Metro Resolution Documentation](https://metrobundler.dev/docs/resolution/)
- [Expo: Customizing Metro](https://docs.expo.dev/guides/customizing-metro/)
- [TypeScript Issue #49083: ESM module resolution](https://github.com/microsoft/TypeScript/issues/49083)
