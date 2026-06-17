const fs = require('fs');

const logPath = '/Users/kla/.gemini/antigravity-ide/brain/73b05d51-1374-438e-b877-34f5ba417691/.system_generated/logs/transcript.jsonl';

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
    const lineStr = JSON.stringify(obj);
    if (lineStr.includes('UI/admin.html')) {
      console.log(`Step ${obj.step_index}: source=${obj.source}, type=${obj.type}, status=${obj.status}`);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          console.log(`  Tool call: ${tc.name}`, tc.args);
        }
      }
    }
  } catch (e) {
  }
}
