const fs = require('fs');
function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  let inP = false;
  let pLine = 0;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.includes('<p ') || line.includes('<p>')) && !line.includes('</p>')) {
      inP = true;
      pLine = i + 1;
    }
    if (inP && line.includes('</p>')) {
      inP = false;
    }
    if (inP && (line.includes('<div') || line.includes('<ul') || line.includes('<h1') || line.includes('<h2') || line.includes('<h3') || line.includes('<h4'))) {
      console.log(`Found invalid nesting in ${file} at line ${i + 1} (started at ${pLine})`);
      console.log(line.trim());
    }
  }
}
checkFile('app/page.tsx');
checkFile('components/AccountSettings.tsx');
checkFile('components/Navbar.tsx');
checkFile('components/WriterDashboard.tsx');
checkFile('components/ProfileTab.tsx');
