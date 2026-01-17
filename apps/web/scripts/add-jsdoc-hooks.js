/**
 * Batch JSDoc addition script for React hooks and components
 * Adds documentation for component functions and hook exports
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Generate JSDoc for hooks based on function name
const getHookJSDoc = (functionName) => {
  const lowerName = functionName.toLowerCase();

  if (lowerName.includes("theme")) {
    return `/**
 * Theme context hook for accessing and switching application theme.
 * @returns {Object} Theme context with current theme and theme switcher
 */`;
  }
  if (lowerName.includes("toast")) {
    return `/**
 * Toast notification hook for displaying temporary UI messages.
 * @returns {Object} Toast utilities (showToast, hideToast, etc.)
 */`;
  }
  if (lowerName.includes("auth")) {
    return `/**
 * Authentication context hook for accessing current user and auth state.
 * @returns {Object} Auth state (user, isAuthenticated, login, logout, etc.)
 */`;
  }
  if (lowerName.includes("razorpay")) {
    return `/**
 * Razorpay payment hook for handling payment initialization and verification.
 * @returns {Object} Payment functions and state (initiatePayment, verifyPayment, etc.)
 */`;
  }
  if (lowerName.includes("role")) {
    return `/**
 * User roles and permissions hook for checking access control.
 * @returns {Object} Role checking utilities (hasRole, hasPermission, etc.)
 */`;
  }
  if (lowerName.includes("filter")) {
    return `/**
 * Trip filters hook for managing search and filter state.
 * @param {number} maxPrice - Maximum price limit for filtering
 * @returns {Object} Filter state and update functions
 */`;
  }
  if (lowerName.includes("config") || lowerName.includes("site")) {
    return `/**
 * Site configuration hook for accessing global site settings.
 * @returns {Object} Site configuration data
 */`;
  }
  if (lowerName.includes("socket")) {
    return `/**
 * WebSocket context hook for real-time communication.
 * @returns {Object} Socket connection and event handlers
 */`;
  }

  return `/**
 * Custom React hook for shared component logic.
 * @returns {Object} Hook state and utilities
 */`;
};

// Generate JSDoc for components based on file name
const getComponentJSDoc = (componentName) => {
  const lowerName = componentName.toLowerCase();

  if (lowerName.includes("modal")) {
    return `/**
 * Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Modal component
 */`;
  }
  if (lowerName.includes("button") || lowerName.includes("btn")) {
    return `/**
 * Reusable button component with various styling options.
 * @param {Object} props - Button props (label, onClick, variant, disabled, etc.)
 * @returns {React.ReactElement} Button element
 */`;
  }
  if (lowerName.includes("card")) {
    return `/**
 * Card component for displaying content in a container.
 * @param {Object} props - Card props (children, title, className, etc.)
 * @returns {React.ReactElement} Card element
 */`;
  }
  if (lowerName.includes("input")) {
    return `/**
 * Form input component with validation and error handling.
 * @param {Object} props - Input props (type, value, onChange, error, etc.)
 * @returns {React.ReactElement} Input element
 */`;
  }
  if (lowerName.includes("layout")) {
    return `/**
 * Layout wrapper component for consistent page structure.
 * @param {Object} props - Layout props (children, header, sidebar, etc.)
 * @returns {React.ReactElement} Layout component
 */`;
  }
  if (lowerName.includes("navbar") || lowerName.includes("header")) {
    return `/**
 * Navigation header component for site-wide navigation.
 * @param {Object} props - Navigation props
 * @returns {React.ReactElement} Navigation component
 */`;
  }
  if (lowerName.includes("footer")) {
    return `/**
 * Footer component with site links and information.
 * @param {Object} props - Footer props
 * @returns {React.ReactElement} Footer component
 */`;
  }
  if (lowerName.includes("list")) {
    return `/**
 * List display component for rendering collections.
 * @param {Object} props - List props (items, renderItem, loading, etc.)
 * @returns {React.ReactElement} List component
 */`;
  }
  if (lowerName.includes("table") || lowerName.includes("grid")) {
    return `/**
 * Data table component for displaying structured data.
 * @param {Object} props - Table props (columns, data, pagination, etc.)
 * @returns {React.ReactElement} Table component
 */`;
  }
  if (lowerName.includes("form")) {
    return `/**
 * Form component with validation and submission handling.
 * @param {Object} props - Form props (fields, onSubmit, initialValues, etc.)
 * @returns {React.ReactElement} Form component
 */`;
  }

  return `/**
 * React component for UI presentation and user interaction.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Component element
 */`;
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];
  let functionsAdded = 0;

  // Check if this is a hook or component file
  const isHook = filePath.includes("hooks") || filePath.includes("use");
  const isComponent = filePath.includes("components");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: export function ComponentName() or export const hookName = () => or export default function
    const funcMatch = line.match(/^export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+))/);
    const defaultMatch = line.match(/^export\s+default\s+function/);

    if (funcMatch || defaultMatch) {
      const functionName = funcMatch
        ? funcMatch[1] || funcMatch[2]
        : line.split("function ")[1]?.split("(")[0] || line.split("const ")[1]?.split(" ")[0];

      // Check if previous lines already have JSDoc
      let hasJSDoc = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (newLines[j] && (newLines[j].includes("/**") || newLines[j].includes("*/"))) {
          hasJSDoc = true;
          break;
        }
      }

      if (!hasJSDoc && functionName) {
        let jsDoc;
        if (isHook) {
          jsDoc = getHookJSDoc(functionName);
        } else {
          jsDoc = getComponentJSDoc(functionName);
        }

        newLines.push(jsDoc);
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
const hookFiles = glob.sync(path.join(__dirname, "..", "src", "hooks", "*.ts"));
const contextFiles = glob.sync(path.join(__dirname, "..", "src", "context", "*.tsx"));
const providerFiles = glob.sync(path.join(__dirname, "..", "src", "components", "*Provider.tsx"));
const allHookFiles = [...hookFiles, ...contextFiles, ...providerFiles];

console.log(`\n📝 Adding JSDoc to ${allHookFiles.length} hook/provider files...\n`);

let totalUpdated = 0;
let totalFunctionsDocumented = 0;

for (const file of allHookFiles) {
  try {
    const count = processFile(file);
    if (count > 0) {
      totalUpdated++;
      totalFunctionsDocumented += count;
      const relativePath = path.relative(path.join(__dirname, ".."), file);
      console.log(`  ✓ ${relativePath} (+${count} functions)`);
    }
  } catch (e) {
    console.error(`  ✗ Error processing ${file}: ${e.message}`);
  }
}

console.log(
  `\n✅ Updated ${totalUpdated} hook files, documented ${totalFunctionsDocumented} functions\n`,
);
