const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<<<<<<< HEAD')) {
        console.log(`Resolving remaining conflicts in ${fullPath}`);
        const regex = /<<<<<<< HEAD(?:\r?\n)?([\s\S]*?)(?:\r?\n)?=======(?:\r?\n)?([\s\S]*?)>>>>>>> [^\r\n]*(?:\r?\n)?/g;
        const newContent = content.replace(regex, '$1\n');
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done resolving remaining conflicts.');
