// Simple test to verify all TypeScript files compile
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findTsFiles(dir, ext = '.tsx') {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      files = files.concat(findTsFiles(fullPath, ext));
    } else if (item.endsWith(ext) || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const tsFiles = findTsFiles(srcDir);
console.log(`Found ${tsFiles.length} TypeScript files:`);
tsFiles.forEach(f => console.log(`  - ${f.replace(__dirname, '.')}`));
