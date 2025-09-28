# Extension Icons

## Creating Icons

To complete the professional setup, you need to create PNG icons from the provided SVG file.

### Required Icons:
- icon-16.png (16x16 pixels)
- icon-32.png (32x32 pixels)
- icon-48.png (48x48 pixels)
- icon-128.png (128x128 pixels)

### Methods to Convert SVG to PNG:

#### Option 1: Online Converter
1. Visit https://svg2png.com or similar online converter
2. Upload the `icon.svg` file
3. Generate all required sizes
4. Download and place in this icons/ directory

#### Option 2: Using Figma/Canva
1. Import the SVG into Figma or Canva
2. Export at the required sizes as PNG
3. Ensure transparent background

#### Option 3: Command Line (if available)
```bash
# Using ImageMagick
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 32x32 icon-32.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 128x128 icon-128.png

# Using Inkscape
inkscape icon.svg -w 16 -h 16 -o icon-16.png
inkscape icon.svg -w 32 -h 32 -o icon-32.png
inkscape icon.svg -w 48 -h 48 -o icon-48.png
inkscape icon.svg -w 128 -h 128 -o icon-128.png
```

### Temporary Workaround
The extension will work without icons, but Chrome will show a default puzzle piece icon until proper PNG icons are added.

### Design Notes
The SVG features:
- Modern gradient background (purple to blue)
- Document icon representing web pages
- Golden star representing AI summarization
- Clean, professional appearance
- Scales well to different sizes