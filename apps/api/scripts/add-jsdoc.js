#!/usr/bin/env node
/**
 * Script to add JSDoc comments to controller functions
 * Runs in batch to process all controller files efficiently
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// JSDoc templates for different controller patterns
const jsdocTemplates = {
  // Authentication controllers
  register: `/**
   * Register a new user with email and password.
   * @param {import('express').Request} req - Express request containing email, password, name in body
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */`,
  login: `/**
   * Authenticate user and return access/refresh tokens with user details.
   * @param {import('express').Request} req - Express request containing email, password in body
   * @param {import('express').Response} res - Express response with cookies and tokens
   * @returns {Promise<void>}
   */`,
  logout: `/**
   * Logout user by clearing refresh token cookie.
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */`,
  refresh: `/**
   * Refresh access token using refresh token from cookies.
   * @param {import('express').Request} req - Express request with refresh_token cookie
   * @param {import('express').Response} res - Express response with new accessToken
   * @returns {Promise<void>}
   */`,

  // Default pattern for CRUD operations
  create: `/**
   * Create a new resource.
   * @param {import('express').Request} req - Express request with resource data in body
   * @param {import('express').Response} res - Express response with created resource
   * @returns {Promise<void>}
   */`,
  get: `/**
   * Retrieve a single resource by ID.
   * @param {import('express').Request} req - Express request with ID in params
   * @param {import('express').Response} res - Express response with resource data
   * @returns {Promise<void>}
   */`,
  list: `/**
   * Retrieve a paginated list of resources.
   * @param {import('express').Request} req - Express request with pagination/filter params
   * @param {import('express').Response} res - Express response with paginated data
   * @returns {Promise<void>}
   */`,
  update: `/**
   * Update an existing resource.
   * @param {import('express').Request} req - Express request with ID in params and updates in body
   * @param {import('express').Response} res - Express response with updated resource
   * @returns {Promise<void>}
   */`,
  delete: `/**
   * Delete a resource by ID.
   * @param {import('express').Request} req - Express request with ID in params
   * @param {import('express').Response} res - Express response confirming deletion
   * @returns {Promise<void>}
   */`,

  // Health check
  healthCheck: `/**
   * Health check endpoint - verifies database and service connectivity.
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response with service status
   * @returns {Promise<void>}
   */`,
};

// Pattern matcher to detect function intention
function detectFunctionIntent(functionName, code) {
  const lower = functionName.toLowerCase();

  for (const [key, template] of Object.entries(jsdocTemplates)) {
    if (lower.includes(key)) {
      return template;
    }
  }

  // Default generic JSDoc
  return `/**
   * Controller function for handling API request.
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>}
   */`;
}

function extractExportedFunctions(content) {
  const functionRegex = /^export\s+(?:const\s+)?(\w+)\s*=.*?(?:async\s+)?\(req.*?\)\s*=>/gm;
  const functions = [];
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    functions.push({
      name: match[1],
      startIndex: match.index,
      lineNumber: content.substring(0, match.index).split("\n").length,
    });
  }

  return functions;
}

function insertJSDoc(content, functions) {
  if (functions.length === 0) return content;

  let modified = false;
  let offset = 0;

  // Sort by position descending to avoid offset issues
  functions.reverse();

  for (const func of functions) {
    const startIndex = func.startIndex + offset;
    const exportLine = content.substring(startIndex);

    // Check if JSDoc already exists (look back 10 lines)
    const precedingText = content.substring(Math.max(0, startIndex - 500), startIndex);
    if (precedingText.includes("/**")) {
      continue; // Skip if JSDoc already exists
    }

    const template = detectFunctionIntent(func.name, content);
    const insertion = template + "\n";

    content = content.substring(0, startIndex) + insertion + content.substring(startIndex);
    offset += insertion.length;
    modified = true;
  }

  return { content, modified };
}

// Main execution
async function processControllers() {
  const controllerDir = path.join(__dirname, "..", "src", "controllers");
  const pattern = path.join(controllerDir, "**", "*.ts");

  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) return reject(err);

      let processedCount = 0;
      let modifiedCount = 0;

      for (const file of files) {
        if (file.includes("index.ts")) continue;

        try {
          let content = fs.readFileSync(file, "utf-8");
          const functions = extractExportedFunctions(content);

          if (functions.length > 0) {
            const { content: newContent, modified } = insertJSDoc(content, functions);

            if (modified) {
              fs.writeFileSync(file, newContent, "utf-8");
              modifiedCount++;
              console.log(
                `✓ Updated ${path.relative(controllerDir, file)} (${functions.length} functions)`,
              );
            }
          }

          processedCount++;
        } catch (error) {
          console.error(`✗ Error processing ${file}: ${error.message}`);
        }
      }

      console.log(
        `\n✅ Processed ${processedCount} controller files, modified ${modifiedCount} files`,
      );
      resolve();
    });
  });
}

processControllers().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
