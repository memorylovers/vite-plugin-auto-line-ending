# vite-plugin-auto-line-ending

A Vite plugin that automatically converts line endings in output JavaScript files based on the platform - CRLF for Windows, LF for others.

## Installation

```bash
# npm
npm install -D vite-plugin-auto-line-ending

# pnpm
pnpm add -D vite-plugin-auto-line-ending

# yarn
yarn add -D vite-plugin-auto-line-ending
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { autoLineEndingPlugin } from 'vite-plugin-auto-line-ending';

export default defineConfig({
  plugins: [
    autoLineEndingPlugin()
  ]
});
```

## How it Works

The plugin detects the current platform using `process.platform` and converts line endings accordingly:

- **Windows (`win32`)**: Converts all line endings to CRLF (`\r\n`)
- **Other platforms**: Converts all line endings to LF (`\n`)

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
