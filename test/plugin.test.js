const WebpackCriticalCSSPlugin = require('../lib/index');

describe('WebpackCriticalCSSPlugin', () => {
  it('should create an instance with default options', () => {
    const plugin = new WebpackCriticalCSSPlugin();
    expect(plugin.options).toEqual({
      inline: true,
      extract: true,
      width: 1300,
      height: 900,
      src: 'index.html',
      dest: 'index.html'
    });
  });

  it('should merge custom options with defaults', () => {
    const customOptions = {
      width: 800,
      height: 600,
      inline: false
    };
    
    const plugin = new WebpackCriticalCSSPlugin(customOptions);
    
    expect(plugin.options).toEqual({
      inline: false,
      extract: true,
      width: 800,
      height: 600,
      src: 'index.html',
      dest: 'index.html'
    });
  });

  it('should validate options schema', () => {
    expect(() => {
      new WebpackCriticalCSSPlugin({
        width: 'invalid' // should be number
      });
    }).toThrow();
  });

  it('should have an apply method', () => {
    const plugin = new WebpackCriticalCSSPlugin();
    expect(typeof plugin.apply).toBe('function');
  });

  it('should register afterEmit hook', () => {
    const plugin = new WebpackCriticalCSSPlugin();
    const mockCompiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn()
        }
      }
    };

    plugin.apply(mockCompiler);

    expect(mockCompiler.hooks.afterEmit.tapAsync).toHaveBeenCalledWith(
      'WebpackCriticalCSSPlugin',
      expect.any(Function)
    );
  });

  describe('findHtmlFiles', () => {
    it('should find HTML files in compilation assets', () => {
      const plugin = new WebpackCriticalCSSPlugin();
      const mockCompilation = {
        assets: {
          'index.html': {},
          'about.html': {},
          'main.js': {},
          'styles.css': {}
        }
      };

      const htmlFiles = plugin.findHtmlFiles(mockCompilation);
      
      expect(htmlFiles).toEqual(['index.html', 'about.html']);
    });

    it('should return empty array when no HTML files found', () => {
      const plugin = new WebpackCriticalCSSPlugin();
      const mockCompilation = {
        assets: {
          'main.js': {},
          'styles.css': {}
        }
      };

      const htmlFiles = plugin.findHtmlFiles(mockCompilation);
      
      expect(htmlFiles).toEqual([]);
    });
  });
}); 