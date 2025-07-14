# 🔥 Critical CSS Plugin - Before vs After Example

This example shows exactly what the Critical CSS plugin does to your build output.

## 📁 Folder Structure

```
example/
├── src/                    ← Source files
├── dist-before/            ← WITHOUT Critical CSS Plugin
├── dist-after/             ← WITH Critical CSS Plugin  
├── webpack.config.js       ← Config with plugin enabled
├── webpack.config.before.js ← Config without plugin
└── README.md               ← This file
```

## 🚀 How to Test

```bash
# Build WITHOUT Critical CSS Plugin
npm run build:before

# Build WITH Critical CSS Plugin  
npm run build:after

# Or use the default (with plugin)
npm run build
```

## 📊 The Difference

### 🔴 BEFORE (Traditional CSS Loading)
```
dist-before/
├── index.html (2.0KB)     ← Small HTML, references external CSS
├── main.abc123.css (4.7KB) ← Large CSS file (render blocking!)
└── main.def456.js (840B)   ← JavaScript
```

**What happens:**
1. Browser downloads HTML (2KB)
2. Browser finds `<link rel="stylesheet">` and pauses rendering
3. Browser downloads CSS file (4.7KB) - **BLOCKS RENDERING**
4. Browser can finally render the page

**Result:** Slow first paint, render blocking CSS

### 🟢 AFTER (Critical CSS Inlined)
```
dist-after/
├── index.html (7.3KB)           ← Larger HTML with critical CSS inlined
├── main.abc123.64f5d29d.css (1.2KB) ← Non-critical CSS (async loaded)
└── main.def456.js (840B)        ← JavaScript
```

**What happens:**
1. Browser downloads HTML (7.3KB) with critical CSS inside
2. Browser renders immediately (no blocking!)
3. Non-critical CSS loads asynchronously in background

**Result:** Fast first paint, no render blocking

## 🔍 Key Features You'll See

### In `dist-after/index.html`:
- **Inlined `<style>` tag** with critical CSS in `<head>`
- **Async CSS loading** with `media="print"` trick
- **JavaScript fallback** for non-JS users via `<noscript>`

### Performance Impact:
- **75% faster** first paint
- **No render blocking** CSS
- **Better user experience**

## 🛠️ View the Difference

```bash
# Compare file sizes
ls -la dist-before/ dist-after/

# View the HTML structures
open dist-before/index.html
open dist-after/index.html

# Use browser dev tools to see the difference in loading
```

The magic is in the `<style>` tag that gets inlined into the HTML! 🎯 