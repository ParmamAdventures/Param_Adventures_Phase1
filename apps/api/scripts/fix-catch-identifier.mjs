#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..");

const files = [
  "tests/integration/admin.test.ts",
  "tests/integration/booking.test.ts",
  "tests/integration/user_profile.test.ts",
  "scripts/test_create_intent_env.js",
  "scripts/test_prod_guard.js",
  "scripts/test_webhook_http.js",
  "scripts/test_webhook_http.ts",
  "scripts/test_trips.js",
];

function fixCatchBlocks(content) {
  return (
    content
      // catch (/* comment only */) {} -> catch (/* comment only */) {}
      // Need to add underscore parameter
      .replace(/catch\s*\(\s*\/\*[^*]*\*\/\s*\)\s*\{\s*\}/g, (_match) => {
        return "catch (/* ignored */) {}"; // Keep as is for now
      })
      // But the actual issue seems to be the missing parameter - let's use _e instead
      .replace(/catch\s*\(\s*\/\*([^*]*)\*\/\s*\)\s*\{\s*\}/g, "catch (/* $1 */) {}")
  );
}

files.forEach((file) => {
  const filePath = path.join(apiDir, file);
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixed = fixCatchBlocks(content);

    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, "utf8");
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error in ${file}:`, error.message);
  }
});
