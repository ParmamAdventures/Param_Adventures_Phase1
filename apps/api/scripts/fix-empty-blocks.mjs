#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..");

const testFiles = [
  "tests/integration/admin.test.ts",
  "tests/integration/booking.test.ts",
  "tests/integration/user_profile.test.ts",
  "scripts/test_webhook_http.ts",
  "scripts/test_create_intent_env.js",
  "scripts/test_prod_guard.js",
  "scripts/test_trips.js",
];

function fixEmptyBlocks(content) {
  return (
    content
      // catch (e) {} -> catch (/* ignored */) {}
      .replace(/catch\s*\(\s*e\s*\)\s*\{\s*\}/g, "catch (/* ignored */) {}")
      // catch () {} -> catch (/* ignored */) {}
      .replace(/catch\s*\(\s*\)\s*\{\s*\}/g, "catch (/* ignored */) {}")
  );
}

testFiles.forEach((file) => {
  const filePath = path.join(apiDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped (not found): ${file}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixed = fixEmptyBlocks(content);

    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, "utf8");
      const changes = (fixed.match(/catch \(\/* ignored \*\//g) || []).length;
      console.log(`✅ Fixed ${changes} empty catch blocks in: ${file}`);
    } else {
      console.log(`⏭️  No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log("\n✨ Empty block fixes complete!");
