/**
 * Simple JSDoc addition script for controller files
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Generic JSDoc template
const createJSDoc = (functionName) => {
  return `/**
 * ${functionName.replace(/([A-Z])/g, " $1").trim()
    .split(" ")
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")}
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */`;
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];
  let functionsAdded = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line is an export function declaration
    const match = line.match(/^export\s+(?:async\s+)?function\s+(\w+)\s*\(/);

    if (match) {
      const functionName = match[1];

      // Check if previous lines already have JSDoc (look back 3 lines max)
      let hasJSDoc = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (newLines[j] && (newLines[j].includes("/**") || newLines[j].includes("*/"))) {
          hasJSDoc = true;
          break;
        }
      }

      if (!hasJSDoc) {
        // Add JSDoc before the function
        newLines.push(createJSDoc(functionName));
        functionsAdded++;
      }
    }

    newLines.push(line);
  }

  if (functionsAdded > 0) {
    fs.writeFileSync(filePath, newLines.join("\n"), "utf-8");
  }

  return functionsAdded;
};

// Main execution
const controllerDir = path.join(__dirname, "..", "src", "controllers");
const pattern = path.join(controllerDir, "**", "*.ts");
const files = glob.sync(pattern).filter(f => !f.includes("index.ts"));

console.log(`\n📝 Adding JSDoc to ${files.length} controller files...\n`);

let totalUpdated = 0;
let totalFunctionsDocumented = 0;

for (const file of files) {
  try {
    const count = processFile(file);
    if (count > 0) {
      totalUpdated++;
      totalFunctionsDocumented += count;
      const relativePath = path.relative(controllerDir, file);
      console.log(`  ✓ ${relativePath} (+${count} functions)`);
    }
  } catch (e) {
    console.error(`  ✗ Error processing ${file}: ${e.message}`);
  }
}

console.log(`\n✅ Updated ${totalUpdated} files, documented ${totalFunctionsDocumented} functions\n`);
