/**
 * Batch JSDoc addition script for controllers
 * Usage: node add-jsdoc-batch.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob").sync;

// JSDoc templates by detected function purpose
const getJSDocByFunctionName = (name) => {
  const lowerName = name.toLowerCase();

  // Authentication
  if (lowerName.includes("register")) {
    return `/**
   * Register a new user account.
   * @param {Request} req - Request with email, password, name in body
   * @param {Response} res - Response with created user
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("login")) {
    return `/**
   * Authenticate user and issue tokens.
   * @param {Request} req - Request with email, password in body
   * @param {Response} res - Response with access/refresh tokens
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("logout") || lowerName.includes("revoke")) {
    return `/**
   * Logout user and invalidate session.
   * @param {Request} req - Request object
   * @param {Response} res - Response object
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("refresh")) {
    return `/**
   * Refresh authentication tokens.
   * @param {Request} req - Request with refresh token
   * @param {Response} res - Response with new access token
   * @returns {Promise<void>}
   */`;
  }

  // CRUD Operations
  if (lowerName.includes("create") || lowerName.includes("add") || lowerName.includes("post")) {
    return `/**
   * Create a new resource.
   * @param {Request} req - Request with resource data in body
   * @param {Response} res - Response with created resource
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("get") || lowerName.includes("fetch") || lowerName.includes("retrieve")) {
    if (lowerName.includes("list") || lowerName.includes("all")) {
      return `/**
   * Retrieve a paginated list of resources.
   * @param {Request} req - Request with pagination/filter parameters
   * @param {Response} res - Response with paginated resource list
   * @returns {Promise<void>}
   */`;
    }
    return `/**
   * Retrieve a single resource by ID.
   * @param {Request} req - Request with resource ID in params
   * @param {Response} res - Response with resource data
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("update") || lowerName.includes("edit") || lowerName.includes("modify")) {
    return `/**
   * Update an existing resource.
   * @param {Request} req - Request with resource ID in params and updates in body
   * @param {Response} res - Response with updated resource
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("delete") || lowerName.includes("remove")) {
    return `/**
   * Delete a resource by ID.
   * @param {Request} req - Request with resource ID in params
   * @param {Response} res - Response confirming deletion
   * @returns {Promise<void>}
   */`;
  }

  // Business Logic
  if (lowerName.includes("health") || lowerName.includes("status")) {
    return `/**
   * Check service health and connectivity status.
   * @param {Request} req - Request object
   * @param {Response} res - Response with health status
   * @returns {Promise<void>}
   */`;
  }
  if (lowerName.includes("search") || lowerName.includes("filter")) {
    return `/**
   * Search or filter resources with specified criteria.
   * @param {Request} req - Request with search/filter parameters
   * @param {Response} res - Response with filtered results
   * @returns {Promise<void>}
   */`;
  }
  if (
    lowerName.includes("approve") ||
    lowerName.includes("reject") ||
    lowerName.includes("verify")
  ) {
    return `/**
   * ${lowerName.includes("approve") ? "Approve" : lowerName.includes("reject") ? "Reject" : "Verify"} resource or request.
   * @param {Request} req - Request with resource ID and decision data
   * @param {Response} res - Response with updated resource
   * @returns {Promise<void>}
   */`;
  }

  // Default
  return `/**
   * Handle API request for ${name.replace(/([A-Z])/g, " $1").toLowerCase()}.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */`;
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;

  // Pattern to find export const/function declarations
  const exportPattern =
    /^(export\s+(?:const\s+)?(\w+)\s*=(?:\s*async)?\s*\(req[^)]*\)|\s*export\s+(?:async\s+)?function\s+(\w+)\s*\()/gm;

  let lastIndex = 0;
  const replacements = [];

  let match;
  while ((match = exportPattern.exec(content)) !== null) {
    const functionName = match[2] || match[3];
    const startIndex = match.index;

    // Check if JSDoc already exists (look back up to 300 chars)
    const beforeText = content.substring(Math.max(0, startIndex - 300), startIndex);
    if (beforeText.includes("/**") && beforeText.includes("*/")) {
      continue; // Already has JSDoc
    }

    const jsdoc = getJSDocByFunctionName(functionName);
    replacements.push({
      startIndex,
      endIndex: startIndex,
      jsdoc,
      functionName,
    });
  }

  // Apply replacements in reverse order to maintain indices
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    content = content.substring(0, r.startIndex) + r.jsdoc + "\n" + content.substring(r.endIndex);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf-8");
    return replacements.length;
  }

  return 0;
};

// Main execution
try {
  const controllerDir = path.join(__dirname, "..", "controllers");
  const files = glob(path.join(controllerDir, "**", "*.ts")).filter((f) => !f.includes("index.ts"));

  console.log(`\n📝 Adding JSDoc to controller files...\n`);

  let totalUpdated = 0;
  let totalFunctionsDocumented = 0;

  for (const file of files) {
    try {
      const count = processFile(file);
      if (count > 0) {
        totalUpdated++;
        totalFunctionsDocumented += count;
        const relativePath = path.relative(controllerDir, file);
        console.log(`  ✓ ${relativePath} (+${count} JSDoc comments)`);
      }
    } catch (e) {
      console.error(`  ✗ Error processing ${file}: ${e.message}`);
    }
  }

  console.log(
    `\n✅ Updated ${totalUpdated} files with ${totalFunctionsDocumented} JSDoc comments\n`,
  );
} catch (e) {
  console.error("Fatal error:", e);
  process.exit(1);
}
