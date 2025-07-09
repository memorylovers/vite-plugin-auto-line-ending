import { describe, it, expect } from 'vitest';
import { autoLineEndingPlugin, convertLineEndings } from '../src/index';
import type { Plugin } from 'vite';

describe('vite-plugin-auto-line-ending', () => {
  describe('Plugin initialization', () => {
    it('should return a plugin object with correct name', () => {
      const plugin = autoLineEndingPlugin();
      expect(plugin.name).toBe('vite-plugin-auto-line-ending');
    });

    it('should have generateBundle and transform hooks', () => {
      const plugin = autoLineEndingPlugin();
      expect(plugin.generateBundle).toBeDefined();
      expect(plugin.transform).toBeDefined();
    });
  });

  describe('convertLineEndings function', () => {
    describe('Windows platform', () => {
      it('should convert LF to CRLF', () => {
        const result = convertLineEndings('line1\nline2\nline3', 'win32');
        expect(result).toBe('line1\r\nline2\r\nline3');
      });

      it('should keep existing CRLF as CRLF', () => {
        const result = convertLineEndings('line1\r\nline2\r\nline3', 'win32');
        expect(result).toBe('line1\r\nline2\r\nline3');
      });

      it('should convert mixed line endings to CRLF', () => {
        const result = convertLineEndings('line1\nline2\r\nline3\rline4', 'win32');
        expect(result).toBe('line1\r\nline2\r\nline3\r\nline4');
      });

      it('should handle empty strings', () => {
        const result = convertLineEndings('', 'win32');
        expect(result).toBe('');
      });

      it('should handle files with only line endings', () => {
        const result = convertLineEndings('\n\n\n', 'win32');
        expect(result).toBe('\r\n\r\n\r\n');
      });
    });

    describe('Non-Windows platforms', () => {
      it('should convert CRLF to LF', () => {
        const result = convertLineEndings('line1\r\nline2\r\nline3', 'darwin');
        expect(result).toBe('line1\nline2\nline3');
      });

      it('should keep existing LF as LF', () => {
        const result = convertLineEndings('line1\nline2\nline3', 'darwin');
        expect(result).toBe('line1\nline2\nline3');
      });

      it('should convert mixed line endings to LF', () => {
        const result = convertLineEndings('line1\nline2\r\nline3\rline4', 'darwin');
        expect(result).toBe('line1\nline2\nline3\nline4');
      });

      it('should handle old Mac CR line endings', () => {
        const result = convertLineEndings('line1\rline2\rline3', 'darwin');
        expect(result).toBe('line1\nline2\nline3');
      });

      it('should handle files with only line endings', () => {
        const result = convertLineEndings('\r\n\r\n\r\n', 'linux');
        expect(result).toBe('\n\n\n');
      });
    });

    describe('Edge cases', () => {
      it('should handle files with no line endings', () => {
        const result = convertLineEndings('single line without line ending', 'win32');
        expect(result).toBe('single line without line ending');
      });

      it('should use current platform when platform not specified', () => {
        const content = 'test\nline';
        const result = convertLineEndings(content);
        // Just check that it returns a string (platform-dependent result)
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Plugin transform hook', () => {
    it('should transform code content', () => {
      const plugin = autoLineEndingPlugin() as Plugin;
      const transform = plugin.transform!;
      // Handle ObjectHook type (can be function or object with handler)
      const transformFn = typeof transform === 'function' ? transform : transform.handler;
      const result = transformFn.call({} as any, 'line1\nline2', 'test.js');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('map', null);
    });
  });

  describe('Plugin generateBundle hook', () => {
    it('should process chunk type files', () => {
      const plugin = autoLineEndingPlugin() as Plugin;
      const bundle = {
        'app.js': {
          type: 'chunk' as const,
          code: 'const a = 1;\nconst b = 2;',
          fileName: 'app.js',
        },
      };

      const generateBundle = plugin.generateBundle!;
      // Handle ObjectHook type (can be function or object with handler)
      const generateBundleFn = typeof generateBundle === 'function' ? generateBundle : generateBundle.handler;
      generateBundleFn.call({} as any, {} as any, bundle as any, false);
      // Code should be transformed based on current platform
      expect(bundle['app.js'].code).toBeDefined();
      expect(typeof bundle['app.js'].code).toBe('string');
    });

    it('should process string asset type files', () => {
      const plugin = autoLineEndingPlugin() as Plugin;
      const bundle = {
        'styles.css': {
          type: 'asset' as const,
          source: 'body {\n  margin: 0;\n}',
          fileName: 'styles.css',
        },
      };

      const generateBundle = plugin.generateBundle!;
      // Handle ObjectHook type (can be function or object with handler)
      const generateBundleFn = typeof generateBundle === 'function' ? generateBundle : generateBundle.handler;
      generateBundleFn.call({} as any, {} as any, bundle as any, false);
      expect(bundle['styles.css'].source).toBeDefined();
      expect(typeof bundle['styles.css'].source).toBe('string');
    });

    it('should skip binary asset files', () => {
      const plugin = autoLineEndingPlugin() as Plugin;
      const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      const bundle = {
        'image.png': {
          type: 'asset' as const,
          source: binaryData,
          fileName: 'image.png',
        },
      };

      const generateBundle = plugin.generateBundle!;
      // Handle ObjectHook type (can be function or object with handler)
      const generateBundleFn = typeof generateBundle === 'function' ? generateBundle : generateBundle.handler;
      generateBundleFn.call({} as any, {} as any, bundle as any, false);
      expect(bundle['image.png'].source).toBe(binaryData);
      expect(bundle['image.png'].source).toBeInstanceOf(Uint8Array);
    });
  });
});