#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..");

const jsFiles = [
  "assign_super_admin.js",
  "debug_prisma_client.js",
  "seed-test-trip.js",
  "server-setup.js",
  "simple-launcher.js",
  "smoke-test.js",
  path.join("prisma", "fix_booking_status.js"),
  path.join("prisma", "list_slugs_json.js"),
  path.join("prisma", "seed_blogs.js"),
  path.join("prisma", "seed_featured_trips.js"),
  path.join("prisma", "seed_test_users.js"),
  path.join("prisma", "seed_trips.js"),
  path.join("prisma", "seed_users.js"),
  path.join("prisma", "seed.js"),
  path.join("scripts", "assignSuperAdmin.js"),
  path.join("scripts", "checkPermissions.js"),
  path.join("scripts", "check_admin_bookings.js"),
  path.join("scripts", "check_booking.js"),
  path.join("scripts", "check_trip.js"),
  path.join("scripts", "cleanup_keep_superadmins.js"),
  path.join("scripts", "cleanup_test_users.js"),
  path.join("scripts", "cloud_migrate.js"),
  path.join("scripts", "create_content_manager.js"),
  path.join("scripts", "ensure_admin.js"),
  path.join("scripts", "get_metrics.js"),
  path.join("scripts", "grant_metrics_permission.js"),
  path.join("scripts", "lifecycle_test.js"),
  path.join("scripts", "phase3_2_test.js"),
  path.join("scripts", "populate_guide_trips.js"),
  path.join("scripts", "seed_admin_booking.js"),
  path.join("scripts", "seed_reviews.js"),
  path.join("scripts", "setup_admin_trip.js"),
  path.join("scripts", "test_admin_fetch.js"),
  path.join("scripts", "test_admin_list_bookings.js"),
  path.join("scripts", "test_bookings.js"),
  path.join("scripts", "test_booking_capacity.js"),
  path.join("scripts", "test_booking_permissions.js"),
  path.join("scripts", "test_create_intent_env.js"),
  path.join("scripts", "test_join_trip.js"),
  path.join("scripts", "test_prod_guard.js"),
  path.join("scripts", "test_webhook_http.js"),
  path.join("scripts", "verify_submission.js"),
];

function convertRequireToImport(content) {
  // Track imports to add at the top
  const importsToAdd = new Set();

  // Convert various require patterns
  let converted = content
    // require("dotenv").config() -> import dotenv
    .replace(/require\s*\(\s*["']dotenv["']\s*\)\s*\.config\s*\([^)]*\)\s*;/g, () => {
      importsToAdd.add('import "dotenv/config.js";');
      return "";
    })
    // const { X } = require("pkg") -> import { X } from "pkg"
    .replace(
      /const\s+\{\s*([^}]+)\s*\}\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)\s*;/g,
      (match, imports, pkg) => {
        importsToAdd.add(`import { ${imports} } from "${pkg}";`);
        return "";
      },
    )
    // const X = require("pkg") -> import X from "pkg"
    .replace(
      /const\s+(\w+)\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)\s*;/g,
      (match, name, pkg) => {
        importsToAdd.add(`import ${name} from "${pkg}";`);
        return "";
      },
    )
    // const X = global.fetch || require("pkg") -> import X from "pkg" (with fallback comment)
    .replace(
      /const\s+(\w+)\s*=\s*global\.fetch\s*\|\|\s*require\s*\(\s*["']([^"']+)["']\s*\)\s*;/g,
      (match, name, pkg) => {
        importsToAdd.add(`import ${name} from "${pkg}";`);
        return "";
      },
    );

  // Add all imports at the beginning (after shebang if exists)
  if (importsToAdd.size > 0) {
    const lines = converted.split("\n");
    let insertIndex = 0;

    // Skip shebang
    if (lines[0]?.startsWith("#!")) {
      insertIndex = 1;
    }

    // Insert imports
    const importsArray = Array.from(importsToAdd).sort();
    converted = [...lines.slice(0, insertIndex), ...importsArray, ...lines.slice(insertIndex)].join(
      "\n",
    );
  }

  return converted;
}

// Process files
jsFiles.forEach((file) => {
  const filePath = path.join(apiDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped (not found): ${file}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const converted = convertRequireToImport(content);

    if (content !== converted) {
      fs.writeFileSync(filePath, converted, "utf8");
      console.log(`✅ Converted: ${file}`);
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log("\n✨ Conversion complete!");
