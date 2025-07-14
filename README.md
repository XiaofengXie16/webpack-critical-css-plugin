# Webpack Critical CSS Plugin

A modern webpack 5 plugin that extracts and inlines critical CSS using the latest [critical](https://github.com/addyosmani/critical) npm module. This plugin helps improve your website's performance by automatically identifying above-the-fold CSS and inlining it into your HTML while loading non-critical CSS asynchronously.

## Features

- ✅ **Webpack 5 Support** - Built specifically for webpack 5 with modern plugin architecture
- ✅ **Latest Critical Module** - Uses the most recent version of critical (^7.2.1)
- ✅ **Automatic Detection** - Automatically finds and processes HTML files in your build
- ✅ **Multiple Viewports** - Support for extracting critical CSS for multiple screen sizes
- ✅ **Async CSS Loading** - Automatically converts stylesheets to async loading
- ✅ **CSS Extraction** - Can extract non-critical CSS to separate files
- ✅ **Schema Validation** - Full options validation with helpful error messages
- ✅ **TypeScript Ready** - Written with modern JavaScript patterns

## Installation

```bash
npm install webpack-critical-css-plugin critical --save-dev
```

**Note:** This plugin requires Node.js 14+ and webpack 5+. The `critical` package has a dependency on Puppeteer for running a headless browser, so make sure your build environment supports this.

## Project Structure

```
webpack-critical-css-plugin/
├── lib/
│   └── index.js              ← Main plugin code
├── example/
│   ├── src/                  ← Source files
│   ├── dist-before/          ← Build WITHOUT plugin
│   ├── dist-after/           ← Build WITH plugin
│   ├── webpack.config.js     ← Config with plugin
│   └── webpack.config.before.js ← Config without plugin
├── test/
│   └── plugin.test.js        ← Test suite
├── package.json              ← NPM package config
└── README.md                 ← This file
```

## Basic Usage

```javascript
const WebpackCriticalCSSPlugin = require('webpack-critical-css-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new WebpackCriticalCSSPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      extract: true,
      width: 1300,
      height: 900
    })
  ]
};
```

## Configuration Options

All options from the [critical library](https://github.com/addyosmani/critical#options) are supported, plus some plugin-specific options:

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `base` | `string` | `compilation.outputPath` | Base directory for source and destination files |
| `src` | `string` | `'index.html'` | HTML source file to process |
| `dest` | `string` | `'index.html'` | Output filename for the processed HTML |
| `inline` | `boolean` | `true` | Inline critical CSS in HTML |
| `extract` | `boolean` | `true` | Extract inlined styles from referenced stylesheets |
| `width` | `number` | `1300` | Viewport width for critical CSS detection |
| `height` | `number` | `900` | Viewport height for critical CSS detection |

### Advanced Options

| Option | Type | Description |
|--------|------|-------------|
| `dimensions` | `Array<{width: number, height: number}>` | Multiple viewport dimensions |
| `target` | `string \| object` | Output targets for CSS/HTML files |
| `ignore` | `object` | CSS rules to ignore (atrule, rule, decl) |
| `assetPaths` | `string[]` | Additional asset paths |
| `penthouse` | `object` | Penthouse-specific options |

### Target Options

You can specify different output targets:

```javascript
new WebpackCriticalCSSPlugin({
  // ... other options
  target: {
    css: 'critical.css',        // Extract critical CSS to file
    html: 'index.html',         // Output HTML file
    uncritical: 'uncritical.css' // Extract non-critical CSS
  }
})
```

### Ignoring CSS Rules

```javascript
new WebpackCriticalCSSPlugin({
  // ... other options
  ignore: {
    atrule: ['@font-face'],           // Ignore at-rules
    rule: [/\.unused-class/],         // Ignore rules by regex
    decl: (node, value) => {          // Ignore declarations
      return /large-background/.test(value);
    }
  }
})
```

### Multiple Viewports

```javascript
new WebpackCriticalCSSPlugin({
  // ... other options
  dimensions: [
    { width: 1200, height: 900 },  // Desktop
    { width: 768, height: 1024 },  // Tablet
    { width: 375, height: 667 }    // Mobile
  ]
})
```

## How It Works

1. **Build Phase**: Webpack builds your assets normally
2. **Post-Processing**: After files are emitted, the plugin processes HTML files
3. **Critical CSS Extraction**: Uses Puppeteer to determine above-the-fold CSS
4. **Inlining**: Inlines critical CSS in `<style>` tags within the HTML
5. **Async Loading**: Converts external stylesheets to async loading
6. **File Updates**: Updates the HTML asset in webpack's compilation

## Example Output

**Before:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

**After:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Critical CSS inlined here */
    h1 { color: blue; font-size: 2rem; }
  </style>
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

## Best Practices

### 1. Use with HTML and CSS Extraction Plugins

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new WebpackCriticalCSSPlugin({
      // Critical CSS plugin should come last
      inline: true,
      extract: true
    })
  ]
};
```

### 2. Production Mode Only

```javascript
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    // ... other plugins
    ...(isProduction ? [
      new WebpackCriticalCSSPlugin({
        width: 1300,
        height: 900
      })
    ] : [])
  ]
};
```

### 3. Multiple Entry Points

For multiple HTML files:

```javascript
new WebpackCriticalCSSPlugin({
  // The plugin will automatically process all HTML files
  // generated by HtmlWebpackPlugin instances
  width: 1300,
  height: 900
})
```

## Performance Considerations

- **Build Time**: Critical CSS extraction adds time to your build as it runs a headless browser
- **CI/CD**: Ensure your CI environment supports Puppeteer (may need additional dependencies)
- **Memory**: Puppeteer requires additional memory, especially for complex pages
- **Caching**: Consider using webpack's persistent caching for better build performance

## Troubleshooting

### Puppeteer Issues

If you encounter Puppeteer-related errors:

```bash
# Install additional dependencies (Ubuntu/Debian)
apt-get update && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Memory Issues

```javascript
new WebpackCriticalCSSPlugin({
  penthouse: {
    timeout: 30000,
    maxEmbeddedBase64Length: 1000
  }
})
```

### Docker Environment

```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
  chromium-browser \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Migration from Other Plugins

### From html-critical-webpack-plugin

```javascript
// Old (html-critical-webpack-plugin)
new HtmlCriticalWebpackPlugin({
  base: path.resolve(__dirname, 'dist'),
  src: 'index.html',
  dest: 'index.html',
  inline: true,
  extract: true,
  width: 375,
  height: 565
})

// New (webpack-critical-css-plugin)
new WebpackCriticalCSSPlugin({
  base: path.resolve(__dirname, 'dist'),
  src: 'index.html',
  dest: 'index.html',
  inline: true,
  extract: true,
  width: 375,
  height: 565
})
```

The API is largely compatible, with improved webpack 5 support and better error handling.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [critical](https://github.com/addyosmani/critical) - The underlying critical CSS extraction library
- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) - HTML file generation for webpack
- [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) - CSS extraction for webpack

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes. 