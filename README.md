# 🎨 TPL Palette Converter

Deployed Page: https://goodlucktrying.github.io/TPL-Palette-Converter/

A web application that converts RGB hex palettes to Tile Layer Pro / Tile Molester (TPL) format. Perfect for game developers, pixel artists, and retro game enthusiasts working with sprite palettes.

## ✨ Features

- **Dual Input Formats**: Support for both RGB hex and BGR LSB order inputs
- **Real-time Preview**: See your palette colors as you type
- **TPL Generation**: Automatically creates properly formatted TPL files
- **Download Support**: One-click download of generated TPL files
- **Palette Comparison**: Side-by-side view of original and converted colors
- **Responsive Design**: Works on desktop and mobile devices
- **Click to Copy**: Click on color swatches to copy hex values

## 🚀 How to Use

### Method 1: RGB Hex Input (16 lines)
1. Select the "RGB Hex (16 lines)" tab
2. Enter 16 RGB hex colors, one per line (e.g., `000000`, `ff0000`)
3. Click "Convert to TPL"
4. Download the generated TPL file

### Method 2: BGR LSB Order Input
1. Select the "BGR LSB Order" tab
2. Enter BGR LSB order data (e.g., `8A 41 7F 02 6F 5E 58 7B`)
3. Click "Convert to TPL"
4. Download the generated TPL file

## 📁 File Structure

```
TPL-Palette-Converter/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎯 TPL Format Output

The app generates TPL files in the following format:

```
TPL v1.0
16
00 000 000 000
01 082 099 132
02 255 156 000
...
```

Where:
- `TPL v1.0` - File header
- `16` - Number of colors
- Each line: `[index] [R] [G] [B]` (space-separated values)

## 🛠️ Technical Details

### RGB Hex Format
- Expects 16 lines of 6-character hex codes
- Each line represents one color in RGB format
- Example: `ff0000` = pure red

### BGR LSB Order Format
- Expects space-separated hex bytes
- Converts from 16-bit BGR (Blue-Green-Red) to RGB
- **Format**: `BBBBBGGGGGRRRRR` (15 bits used, 1 bit unused)
- **Byte Order**: LSB (Least Significant Byte first)
- **Channel Bits**: 5 bits per channel (0-31 values)
- Processes 32 bytes (16 colors × 2 bytes per color)

### Color Validation
- Automatically validates hex color format
- Pads incomplete palettes with black (`000000`)
- Limits to maximum 16 colors

## 🔍 BGR to RGB Conversion

The app correctly converts your BGR LSB data:

**Input BGR**: `8A 41 7F 02 6F 5E 58 7B 6F 01 D3 01 BA 42 7F 5B 80 59 B9 01 51 00 21 04`

**Process**:
1. Each color uses 2 bytes (e.g., `8A 41`)
2. Combines as `418A` (LSB order)
3. Extracts: B=10, G=8, R=16
4. Scales 5-bit (0-31) to 8-bit (0-255)
5. Converts to RGB hex

**Output**: The same colors as your RGB hex example

## 🔧 Customization

### Adding More Colors
To support more than 16 colors, modify the `generateTPLContent()` function in `script.js`:

```javascript
generateTPLContent(colors) {
    let tplContent = 'TPL v1.0\n';
    tplContent += colors.length + '\n'; // Dynamic color count
    
    colors.forEach((color, index) => {
        // ... existing code ...
    });
    
    return tplContent;
}
```

### Changing TPL Format
Modify the `generateTPLContent()` function to output different TPL formats as needed.

## 🚨 Troubleshooting

### Common Issues

1. **"Please enter valid palette data first"**
   - Ensure you have entered valid hex colors
   - Check that RGB format has 6 characters per line
   - Verify BGR format has complete byte pairs

2. **Colors not displaying correctly**
   - Verify hex color format (6 characters: 0-9, A-F)
   - Check for extra spaces or invalid characters

### Validation Rules

- **RGB Format**: Must be exactly 6 hex characters (0-9, A-F)
- **BGR Format**: Must be complete byte pairs (even number of characters)
- **Color Count**: Maximum 16 colors supported

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
