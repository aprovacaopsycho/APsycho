const fs = require('fs');
const path = require('path');

const rotacPath = path.join(__dirname, 'rotac.html');
const debugPath = path.join(__dirname, 'rotac_debug.html');

try {
    const rotacContent = fs.readFileSync(rotacPath, 'utf8');
    const debugContent = fs.readFileSync(debugPath, 'utf8');

    // Find config line in rotac.html
    const rotacLines = rotacContent.split('\n');
    const configLine = rotacLines.find(line => line.trim().startsWith('"imgWidth":'));

    if (!configLine) {
        console.error('Could not find config line in rotac.html');
        process.exit(1);
    }

    console.log('Found config in rotac.html');

    // Replace in rotac_debug.html
    const debugLines = debugContent.split('\n');
    const debugConfigIndex = debugLines.findIndex(line => line.trim().startsWith('"imgWidth":'));

    if (debugConfigIndex === -1) {
        console.error('Could not find config line in rotac_debug.html');
        process.exit(1);
    }

    debugLines[debugConfigIndex] = configLine;

    // Also update max-width if needed
    // Check max-width in rotac.html
    const maxWidthMatch = rotacContent.match(/max-width:\s*(\d+px)/);
    if (maxWidthMatch) {
        const currentMaxWidth = maxWidthMatch[1];
        console.log(`Found max-width in rotac.html: ${currentMaxWidth}`);

        // Update in debugLines
        // Assuming .responsive-paper style block
        // We'll iterate to find .responsive-paper rule and max-width inside it
        let inResponsivePaper = false;
        for (let i = 0; i < debugLines.length; i++) {
            if (debugLines[i].includes('.responsive-paper {')) {
                inResponsivePaper = true;
            }
            if (inResponsivePaper && debugLines[i].includes('max-width:')) {
                debugLines[i] = `            max-width: ${currentMaxWidth};`;
                console.log(`Updated max-width in rotac_debug.html to ${currentMaxWidth}`);
                inResponsivePaper = false; // Done
            }
        }
    }

    fs.writeFileSync(debugPath, debugLines.join('\n'));
    console.log('Successfully updated rotac_debug.html');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
