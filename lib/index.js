const { validate } = require('schema-utils');

const schema = {
    type: 'object',
    properties: {
        base: {
            type: 'string',
            description: 'Base directory for source and destination files'
        },
        src: {
            type: 'string',
            description: 'HTML source file'
        },
        dest: {
            type: 'string',
            description: 'Output file for critical CSS inlined HTML'
        },
        inline: {
            type: 'boolean',
            description: 'Inline critical CSS in HTML'
        },
        extract: {
            type: 'boolean',
            description: 'Extract inlined styles from referenced stylesheets'
        },
        width: {
            type: 'number',
            description: 'Viewport width'
        },
        height: {
            type: 'number',
            description: 'Viewport height'
        },
        dimensions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    width: { type: 'number' },
                    height: { type: 'number' }
                }
            },
            description: 'Multiple viewport dimensions'
        },

        target: {
            oneOf: [
                { type: 'string' },
                {
                    type: 'object',
                    properties: {
                        css: { type: 'string' },
                        html: { type: 'string' },
                        uncritical: { type: 'string' }
                    }
                }
            ],
            description: 'Output target(s)'
        },
        ignore: {
            type: 'object',
            properties: {
                atrule: { type: 'array' },
                rule: { type: 'array' },
                decl: {}
            },
            description: 'CSS rules to ignore'
        },
        assetPaths: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional asset paths'
        },
        penthouse: {
            type: 'object',
            description: 'Penthouse specific options'
        }
    },
    additionalProperties: false
};

class WebpackCriticalCSSPlugin {
    static defaultOptions = {
        inline: true,
        extract: true,
        width: 1300,
        height: 900,
        src: 'index.html',
        dest: 'index.html'
    };

    constructor(options = {}) {
        // Validate options
        validate(schema, options, {
            name: 'WebpackCriticalCSSPlugin',
            baseDataPath: 'options'
        });

        // Merge with defaults
        this.options = { ...WebpackCriticalCSSPlugin.defaultOptions, ...options };
    }

    apply(compiler) {
        const pluginName = WebpackCriticalCSSPlugin.name;

        // Hook into the afterEmit phase to process files after they've been written to disk
        compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback) => {
            this.processCriticalCSS(compilation, callback);
        });
    }

    async processCriticalCSS(compilation, callback) {
        try {
            // Determine base path
            const base = this.options.base || compilation.compiler.outputPath;

            // Find HTML files to process
            const htmlFiles = this.findHtmlFiles(compilation);

            if (htmlFiles.length === 0) {
                compilation.getLogger('WebpackCriticalCSSPlugin').warn('No HTML files found to process');
                callback();
                return;
            }

            // Process each HTML file
            const promises = htmlFiles.map(htmlFile => this.processSingleFile(htmlFile, base, compilation));

            await Promise.all(promises);

            callback();
        } catch (error) {
            compilation.getLogger('WebpackCriticalCSSPlugin').error('Critical CSS processing failed:', error);
            callback(error);
        }
    }

    findHtmlFiles(compilation) {
        const htmlFiles = [];

        // Look for HTML files in compilation assets
        Object.keys(compilation.assets).forEach(filename => {
            if (filename.endsWith('.html')) {
                htmlFiles.push(filename);
            }
        });

        return htmlFiles;
    }

      async processSingleFile(htmlFile, base, compilation) {
    const logger = compilation.getLogger('WebpackCriticalCSSPlugin');
    
    try {
      // Dynamically import critical module (ESM)
      const { generate } = await import('critical');
      
      // Prepare critical options
      const criticalOptions = {
        ...this.options,
        base: base,
        src: this.options.src || htmlFile,
        target: this.options.dest || htmlFile
      };

      // Remove plugin-specific options that critical doesn't understand
      delete criticalOptions.dest;

      logger.info(`Processing critical CSS for ${htmlFile}`);

      // Generate critical CSS
      const result = await generate(criticalOptions);

            if (result.html && this.options.inline) {
                // Update the asset with the new HTML containing inlined critical CSS
                const outputFilename = this.options.dest || htmlFile;
                compilation.assets[outputFilename] = new (compilation.compiler.webpack.sources.RawSource)(result.html);

                logger.info(`Updated ${outputFilename} with inlined critical CSS`);
            }

            if (result.css && this.options.target && typeof this.options.target === 'object' && this.options.target.css) {
                // Save standalone critical CSS file
                compilation.assets[this.options.target.css] = new (compilation.compiler.webpack.sources.RawSource)(result.css);
                logger.info(`Generated critical CSS file: ${this.options.target.css}`);
            }

            if (result.uncritical && this.options.target && typeof this.options.target === 'object' && this.options.target.uncritical) {
                // Save uncritical CSS file
                compilation.assets[this.options.target.uncritical] = new (compilation.compiler.webpack.sources.RawSource)(result.uncritical);
                logger.info(`Generated uncritical CSS file: ${this.options.target.uncritical}`);
            }

        } catch (error) {
            logger.error(`Failed to process ${htmlFile}:`, error);
            throw error;
        }
    }
}

module.exports = WebpackCriticalCSSPlugin; 