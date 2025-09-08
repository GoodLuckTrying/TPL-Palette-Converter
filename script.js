// TPL Palette Converter
class TPLPaletteConverter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentFormat = 'rgb';
        // Initialize palette previews and example data after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.updatePalettePreviews();
            this.populateExampleData();
        }, 100);
    }

    initializeElements() {
        // Tab buttons
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.rgbInput = document.getElementById('rgb-input');
        this.bgrInput = document.getElementById('bgr-input');
        
        // Input areas
        this.rgbPalette = document.getElementById('rgb-palette');
        this.bgrPalette = document.getElementById('bgr-palette');
        
        // Preview areas
        this.rgbPreview = document.getElementById('rgb-preview');
        this.bgrPreview = document.getElementById('bgr-preview');
        
        // Output elements
        this.outputSection = document.getElementById('output-section');
        this.tlpContent = document.getElementById('tlp-content');
        this.downloadBtn = document.getElementById('download-btn');
        this.filename = document.getElementById('filename');
        
        // Comparison elements
        this.originalColors = document.getElementById('original-colors');
        this.convertedColors = document.getElementById('converted-colors');
        
        // Convert button
        this.convertBtn = document.getElementById('convert-btn');
        
        // Upload elements
        this.tplUpload = document.getElementById('tpl-upload');
        this.uploadBtn = document.getElementById('upload-btn');
    }

    bindEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.format));
        });

        // Input changes for real-time preview
        this.rgbPalette.addEventListener('input', () => this.updateRGBPreview());
        this.bgrPalette.addEventListener('input', () => this.updateBGRPreview());

        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertToTPL());

        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadTPL());
        
        // Conversion buttons
        document.getElementById('rgb-to-bgr-btn').addEventListener('click', () => this.convertRGBtoBGR());
        document.getElementById('bgr-to-rgb-btn').addEventListener('click', () => this.convertBGRtoRGB());
        
        // Upload functionality
        this.uploadBtn.addEventListener('click', () => this.handleTPLUpload());
    }

    switchTab(format) {
        this.currentFormat = format;
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });

        // Update input areas
        this.rgbInput.classList.toggle('active', format === 'rgb');
        this.bgrInput.classList.toggle('active', format === 'bgr');

        // Update previews
        if (format === 'rgb') {
            this.updateRGBPreview();
        } else {
            this.updateBGRPreview();
        }
    }

    updateRGBPreview() {
        const colors = this.parseRGBInput();
        this.displayPalettePreview(this.rgbPreview, colors);
    }

    updateBGRPreview() {
        const colors = this.parseBGRInput();
        this.displayPalettePreview(this.bgrPreview, colors);
    }

    updatePalettePreviews() {
        // Update both previews
        this.updateRGBPreview();
        this.updateBGRPreview();
    }

    parseRGBInput() {
        const input = this.rgbPalette.value.trim();
        if (!input) return [];

        const lines = input.split('\n').filter(line => line.trim());
        const colors = [];

        for (let i = 0; i < Math.min(lines.length, 16); i++) {
            const line = lines[i].trim();
            if (line.match(/^[0-9a-fA-F]{6}$/)) {
                colors.push(line);
            }
        }

        // Pad to 16 colors if needed
        while (colors.length < 16) {
            colors.push('000000');
        }

        return colors;
    }

    parseBGRInput() {
        const input = this.bgrPalette.value.trim();
        if (!input) return [];

        // Remove spaces and split into bytes
        const hexString = input.replace(/\s/g, '');
        const bytes = [];
        
        for (let i = 0; i < hexString.length; i += 2) {
            if (i + 1 < hexString.length) {
                bytes.push(parseInt(hexString.substr(i, 2), 16));
            }
        }

        console.log('Parsed BGR bytes:', bytes);

        // Use the correct 15-bit BGR LSB format
        const colors = this.extract15BitBGR(bytes);
        
        // Pad to 16 colors if needed
        while (colors.length < 16) {
            colors.push('000000');
        }

        return colors;
    }

    extract15BitBGR(bytes) {
        const colors = [];
        for (let i = 0; i < Math.min(bytes.length, 32); i += 2) {
            if (i + 1 < bytes.length) {
                const color16bit = (bytes[i + 1] << 8) | bytes[i];
                
                // Apply the correct reverse formula:
                // R = (color % 32) × 8
                // G = ((color / 32) % 32) × 8  
                // B = ((color / 1024) % 32) × 8
                const r = (color16bit % 32) * 8;
                const g = (Math.floor(color16bit / 32) % 32) * 8;
                const b = (Math.floor(color16bit / 1024) % 32) * 8;
                
                const rgb = (r << 16) | (g << 8) | b;
                const hexColor = rgb.toString(16).padStart(6, '0');
                colors.push(hexColor);
                
                // Debug logging for first few colors
                if (colors.length <= 3) {
                    console.log(`Color ${colors.length-1}: BGR16bit=${color16bit.toString(16).padStart(4, '0')} -> RGB=${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} -> Hex=${hexColor}`);
                }
                
                // Log all colors for debugging
                console.log(`Color ${colors.length-1}: #${hexColor} (R:${r}, G:${g}, B:${b})`);
            }
        }
        return colors;
    }



    displayPalettePreview(container, colors) {
        container.innerHTML = '';
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = `#${color}`;
            swatch.title = `#${color} (Index: ${index})`;
            
            // Add click to copy functionality
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(`#${color}`);
                this.showCopyFeedback(swatch);
            });
            
            container.appendChild(swatch);
        });
    }

    showCopyFeedback(element) {
        const originalTitle = element.title;
        element.title = 'Copied!';
        element.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            element.title = originalTitle;
            element.style.transform = 'scale(1)';
        }, 1000);
    }

    convertToTPL() {
        let colors, originalColors;
        
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
            originalColors = [...colors];
            console.log('Using RGB format, colors:', colors);
        } else {
            colors = this.parseBGRInput();
            originalColors = [...colors];
            console.log('Using BGR format, colors:', colors);
        }

        if (colors.length === 0) {
            alert('Please enter valid palette data first.');
            return;
        }

        console.log('Converting colors:', colors);

        // Generate TPL content
        const tplContent = this.generateTPLContent(colors);
        console.log('Generated TPL content:', tplContent);
        
        // Display results
        this.tlpContent.textContent = tplContent;
        this.outputSection.style.display = 'block';
        
        // Update filename - use .tpl extension for Tile Layer Pro
        this.filename.textContent = `palette_${Date.now()}.tpl`;
        
        // Display palette comparison
        this.displayPaletteComparison(originalColors, colors);
        
        // Scroll to output
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateTPLContent(colors) {
        console.log('Generating TPL content for colors:', colors);
        
        // Tile Layer Pro uses binary TPL format, not text
        // We'll generate both formats for compatibility
        
        // Text format for display
        let textContent = 'TPL v1.0\n';
        textContent += '16\n'; // Number of colors
        
        colors.forEach((color, index) => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Format: index R G B (no leading zeros, space-separated)
            const line = `${index} ${r} ${g} ${b}`;
            textContent += line + '\n';
            
            console.log(`Line ${index}: ${line} (from color #${color})`);
        });
        
        console.log('Generated text content:', textContent);
        return textContent;
    }
    
    generateBinaryTPL(colors) {
        // Generate binary TPL format for Tile Layer Pro
        const buffer = new ArrayBuffer(4 + 16 * 3); // 4 bytes header + 16 colors * 3 bytes each
        const view = new Uint8Array(buffer);
        
        // Header: "TPL" (3 bytes) + null terminator (1 byte)
        view[0] = 0x54; // 'T'
        view[1] = 0x50; // 'P'
        view[2] = 0x4C; // 'L'
        view[3] = 0x00; // null terminator
        
        // Palette data: 16 colors, each 3 bytes (R, G, B)
        for (let i = 0; i < Math.min(colors.length, 16); i++) {
            const color = colors[i];
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            const offset = 4 + i * 3;
            view[offset] = r;
            view[offset + 1] = g;
            view[offset + 2] = b;
        }
        
        console.log('Generated binary TPL:', Array.from(view).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        return buffer;
    }

    displayPaletteComparison(original, converted) {
        // Display original colors
        this.displayComparisonColors(this.originalColors, original);
        
        // Display converted colors
        this.displayComparisonColors(this.convertedColors, converted);
    }

    displayComparisonColors(container, colors) {
        container.innerHTML = '';
        
        const colorGrid = document.createElement('div');
        colorGrid.className = 'comparison-colors';
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'comparison-swatch';
            swatch.style.backgroundColor = `#${color}`;
            swatch.title = `#${color}`;
            colorGrid.appendChild(swatch);
        });
        
        container.appendChild(colorGrid);
    }

    downloadTPL() {
        // Get the current colors
        let colors;
        if (this.currentFormat === 'rgb') {
            colors = this.parseRGBInput();
        } else {
            colors = this.parseBGRInput();
        }
        
        if (colors.length === 0) {
            alert('Please enter valid palette data first.');
            return;
        }
        
        // Generate binary TPL for Tile Layer Pro
        const binaryTPL = this.generateBinaryTPL(colors);
        const blob = new Blob([binaryTPL], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.filename.textContent;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Downloaded binary TPL file');
    }

    convertRGBtoBGR() {
        const colors = this.parseRGBInput();
        if (colors.length === 0) {
            alert('Please enter valid RGB hex colors first.');
            return;
        }

        // Convert RGB to 15-bit BGR format using the correct formula
        const bgrBytes = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Apply the correct conversion formula:
            // R = R / 8, G = G / 8, B = B / 8
            // Color = B × 1024 + G × 32 + R
            const r5bit = Math.floor(r / 8);
            const g5bit = Math.floor(g / 8);
            const b5bit = Math.floor(b / 8);
            
            // Pack into 15-bit BGR format: BBBBBGGGGGRRRRR
            const bgr15bit = b5bit * 1024 + g5bit * 32 + r5bit;
            
            // Split into LSB and MSB bytes (little-endian)
            const lsb = bgr15bit & 0xFF;
            const msb = (bgr15bit >> 8) & 0xFF;
            
            bgrBytes.push(lsb.toString(16).padStart(2, '0'));
            bgrBytes.push(msb.toString(16).padStart(2, '0'));
        });
        
        // Format as space-separated hex values
        const bgrString = bgrBytes.join(' ');
        
        // Switch to BGR tab and populate the data
        this.switchTab('bgr');
        this.bgrPalette.value = bgrString;
        this.updateBGRPreview();
        
        // Show success message
        this.showConversionMessage('RGB → BGR conversion completed!', 'success');
        
        console.log('Converted RGB to BGR LSB:', bgrString);
    }

    convertBGRtoRGB() {
        const colors = this.parseBGRInput();
        if (colors.length === 0) {
            alert('Please enter valid BGR LSB data first.');
            return;
        }

        // Convert BGR to RGB hex format using the correct reverse formula
        const rgbLines = [];
        colors.forEach(color => {
            // Parse the hex color (which is already in RGB format from parseBGRInput)
            // But we need to apply the reverse formula to get the original RGB values
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // The color is already converted to RGB by parseBGRInput, so we can use it directly
            rgbLines.push(color);
        });
        
        // Format as one color per line
        const rgbString = rgbLines.join('\n');
        
        // Switch to RGB tab and populate the data
        this.switchTab('rgb');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();
        
        // Show success message
        this.showConversionMessage('BGR → RGB conversion completed!', 'success');
        
        console.log('Converted BGR to RGB hex:', rgbString);
    }

    showConversionMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `conversion-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert after the current tab's input area
        const currentInput = this.currentFormat === 'rgb' ? this.rgbInput : this.bgrInput;
        currentInput.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    populateExampleData() {
        const rgbExample = `000000
526384
ff9c00
7b9cbd
c6d6f7
ffffff
f7ef8c
c6b54a
7b5a00
9c7300
d6ad84
ffdeb5
0063b5
ce6b00
8c1000
080808`;

        // Note: The BGR data below may not convert to the exact RGB colors above
        // This is just example data - you should input your actual BGR data
        const bgrExample = `00 00 8A 41 7F 02 6F 5E 58 7B FF 7F BE 47 D8 26 6F 01 D3 01 BA 42 7F 5B 80 59 B9 01 51 00 21 04`;

        // Set example data if fields are empty
        if (!this.rgbPalette.value) {
            this.rgbPalette.value = rgbExample;
            this.updateRGBPreview();
        }
        if (!this.bgrPalette.value) {
            this.bgrPalette.value = bgrExample;
            this.updateBGRPreview();
        }
    }

    handleTPLUpload() {
        const file = this.tplUpload.files[0];
        if (!file) {
            alert('Please select a TPL file first.');
            return;
        }

        if (!file.name.toLowerCase().endsWith('.tpl')) {
            alert('Please select a valid TPL file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const paletteData = this.parseTPLFile(arrayBuffer);
                
                if (paletteData) {
                    // Populate both input fields
                    this.populateFromTPLData(paletteData);
                    this.showConversionMessage('TPL file loaded successfully!', 'success');
                } else {
                    alert('Failed to parse TPL file. Please ensure it\'s a valid TPL palette file.');
                }
            } catch (error) {
                console.error('Error parsing TPL file:', error);
                alert('Error parsing TPL file: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(file);
    }

    parseTPLFile(arrayBuffer) {
        try {
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Check for TPL header (TPL\0)
            if (uint8Array.length < 4 || 
                String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3]) !== 'TPL\0') {
                throw new Error('Invalid TPL header');
            }

            // TPL files typically have a 4-byte header followed by palette data
            // Each color is 3 bytes (RGB) for 16 colors = 48 bytes + 4 byte header = 52 bytes total
            const expectedSize = 4 + (16 * 3);
            if (uint8Array.length < expectedSize) {
                throw new Error('TPL file too small - expected at least ' + expectedSize + ' bytes');
            }

            const colors = [];
            // Skip header (4 bytes) and read 16 RGB colors
            for (let i = 4; i < expectedSize; i += 3) {
                const r = uint8Array[i];
                const g = uint8Array[i + 1];
                const b = uint8Array[i + 2];
                
                // Convert to hex string
                const hexColor = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
                colors.push(hexColor);
                console.log(`Color ${Math.floor((i-4)/3) + 1}: R=${r}, G=${g}, B=${b} -> ${hexColor}`);
            }

            return colors;
        } catch (error) {
            console.error('Error parsing TPL file:', error);
            return null;
        }
    }

    populateFromTPLData(colors) {
        if (!colors || colors.length !== 16) {
            console.error('Invalid palette data:', colors);
            return;
        }

        // Populate RGB input (one color per line)
        const rgbString = colors.join('\n');
        this.rgbPalette.value = rgbString;
        this.updateRGBPreview();

        // Convert to BGR LSB and populate BGR input
        const bgrColors = [];
        colors.forEach(color => {
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            
            // Convert to 15-bit BGR using the same formula as convertRGBtoBGR
            const r5bit = Math.floor(r / 8);
            const g5bit = Math.floor(g / 8);
            const b5bit = Math.floor(b / 8);
            const bgr15bit = b5bit * 1024 + g5bit * 32 + r5bit;
            
            // Convert to hex and format as LSB (2 bytes)
            const bgrHex = bgr15bit.toString(16).padStart(4, '0');
            const lsb = bgrHex.substr(2, 2);
            const msb = bgrHex.substr(0, 2);
            bgrColors.push(lsb + ' ' + msb);
        });

        const bgrString = bgrColors.join(' ');
        this.bgrPalette.value = bgrString;
        this.updateBGRPreview();

        // Switch to RGB tab to show the loaded data
        this.switchTab('rgb');
        
        console.log('Loaded TPL file with colors:', colors);
        console.log('Converted to BGR LSB:', bgrString);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TPLPaletteConverter();
});
