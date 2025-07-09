import type { Plugin } from 'vite';

/**
 * Converts line endings based on the platform
 * @param content - The content to convert
 * @param platform - Optional platform override for testing
 * @returns The content with converted line endings
 */
export function convertLineEndings(content: string, platform?: string): string {
  const isWindows = (platform || process.platform) === 'win32';
  if (isWindows) {
    // Windows: Convert to CRLF (2-step process to avoid \r\r\n)
    // Step 1: Normalize all line endings to LF
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Step 2: Convert LF to CRLF
    return normalized.replace(/\n/g, '\r\n');
  } else {
    // Other platforms: Convert all line endings to LF
    // Handle CRLF, CR, and LF
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
}

/**
 * Vite plugin to convert line endings with options

 * @returns Vite plugin
 */
export function autoLineEndingPlugin(): Plugin {
  return {
    name: 'vite-plugin-auto-line-ending',

    // Handle build output
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        // Process JavaScript chunks
        if (chunk.type === 'chunk') {
          chunk.code = convertLineEndings(chunk.code);
        }

        // Process JavaScript assets
        if (chunk.type === 'asset' && typeof chunk.source === 'string') {
          chunk.source = convertLineEndings(chunk.source);
        }
      }
    },

    // Handle development mode transformations
    transform(code, _id) {
      return {
        code: convertLineEndings(code),
        // Source map is not generated because:
        // 1. Line ending conversion doesn't change line numbers
        // 2. The transformation is purely cosmetic
        // 3. Avoiding source map generation improves performance
        map: null,
      };
    },
  };
}
