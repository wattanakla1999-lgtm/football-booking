const fs = require('fs');
const path = require('path');

const logPath = '/Users/kla/.gemini/antigravity-ide/brain/73b05d51-1374-438e-b877-34f5ba417691/.system_generated/logs/transcript.jsonl';
const targetPath = '/Users/kla/Desktop/booking all/football/football-booking/UI/admin.html';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found:', logPath);
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Look for USER_EXPLICIT type and CODE_ACTION or VIEW_FILE where the content contains UI/admin.html and we have the code
    if (obj.source === 'USER_EXPLICIT' && obj.type === 'CODE_ACTION') {
      const content = obj.content;
      if (content.includes('UI/admin.html') && content.includes('[diff_block_start]')) {
        console.log('Found CODE_ACTION in step', obj.step_index);
        const startIdx = content.indexOf('[diff_block_start]');
        const endIdx = content.indexOf('[diff_block_end]');
        if (startIdx !== -1 && endIdx !== -1) {
          const diffText = content.substring(startIdx, endIdx);
          // Split lines and extract lines starting with '+' (excluding the header @@)
          const diffLines = diffText.split('\n');
          const restoredLines = [];
          for (let i = 2; i < diffLines.length; i++) {
            if (diffLines[i].startsWith('+')) {
              restoredLines.push(diffLines[i].substring(1));
            } else if (diffLines[i].startsWith('-')) {
              // Ignore deleted
            } else {
              restoredLines.push(diffLines[i]);
            }
          }
          const restoredContent = restoredLines.join('\n');
          fs.writeFileSync(targetPath, restoredContent, 'utf8');
          console.log('Restored UI/admin.html successfully. Size:', restoredContent.length);
          break;
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse error for line
  }
}
