
const fs = require('fs');
const path = require('path');

const htmlPath = 'rotac.html';
const jsonPath = 'config_fixed.json';

console.log("Reading files...");
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
const newItemsJson = fs.readFileSync(jsonPath, 'utf8').trim();

// 1. Replace Items
console.log("Replacing config items...");
const startMarker = '"items": ['; // This assumes the format "items": [...]
const startPos = htmlContent.indexOf(startMarker);

if (startPos === -1) {
    console.error("Could not find start of items array");
    process.exit(1);
}

// Find the start of the array bracket
const arrayStartIdx = startPos + '"items": '.length; // This should point to [

// Safely find the matching bracket
let depth = 0;
let arrayEndIdx = -1;

for (let i = arrayStartIdx; i < htmlContent.length; i++) {
    if (htmlContent[i] === '[') {
        depth++;
    } else if (htmlContent[i] === ']') {
        depth--;
        if (depth === 0) {
            arrayEndIdx = i + 1; // Include the closing bracket
            break;
        }
    }
}

if (arrayEndIdx === -1) {
    console.error("Could not find end of items array");
    process.exit(1);
}

const newHtml = htmlContent.substring(0, arrayStartIdx) + newItemsJson + htmlContent.substring(arrayEndIdx);
htmlContent = newHtml;

// 2. Remove Audio "start"
console.log("Removing 'start' audio definition...");
// Regex to remove: start: new Audio('...'),
// We need to be careful with multiline or varying spaces
htmlContent = htmlContent.replace(/start:\s*new\s*Audio\('[^']+'\),?/g, "");

// 3. Remove dependencies on "start" audio
console.log("Removing 'start' audio usage...");
htmlContent = htmlContent.replace(/this\.audio\.start\.play\(\);/g, '// Audio removido');

console.log("Writing updated file...");
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

console.log("Updates applied successfully.");
