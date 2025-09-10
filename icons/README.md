# Icon Files

This directory contains various icon sizes for cross-platform compatibility.

## Required Icons

To complete the icon system, generate PNG files from the SVG sources:

### Favicon Icons
- favicon-16x16.png (from favicon.svg, resize to 16x16)
- favicon-32x32.png (from favicon.svg, resize to 32x32)

### Apple Touch Icons (from apple-touch-icon.svg)
- apple-touch-icon-57x57.png
- apple-touch-icon-60x60.png
- apple-touch-icon-72x72.png
- apple-touch-icon-76x76.png
- apple-touch-icon-114x114.png
- apple-touch-icon-120x120.png
- apple-touch-icon-144x144.png
- apple-touch-icon-152x152.png
- apple-touch-icon-180x180.png

### PWA Icons (from icons/icon-192.svg and logo.svg)
- icon-16.png
- icon-32.png
- icon-48.png
- icon-72.png
- icon-96.png
- icon-144.png
- icon-192.png (from icons/icon-192.svg)
- icon-512.png (from logo.svg)

### Shortcut Icons
- shortcut-url.png (96x96 with URL symbol)
- shortcut-wifi.png (96x96 with WiFi symbol)

## Generation Commands

You can use tools like:
- ImageMagick: `convert input.svg -resize 192x192 output.png`
- Inkscape: `inkscape -w 192 -h 192 input.svg -o output.png`
- Online converters or design tools

## SVG Sources
- logo.svg (512x512 main logo)
- favicon.svg (32x32 favicon)
- apple-touch-icon.svg (180x180 Apple touch icon)
- icons/icon-192.svg (192x192 PWA icon)