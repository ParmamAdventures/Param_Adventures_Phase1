/**
 * Batch JSDoc addition script for React components
 * Adds documentation for exported component functions
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

// Generate JSDoc for components based on component name patterns
const getComponentJSDoc = (componentName) => {
  const lowerName = componentName.toLowerCase();

  // Pattern-based JSDoc generation
  if (lowerName.includes("modal")) {
    return `/**
 * ${componentName} - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */`;
  }
  if (lowerName.includes("button") || lowerName.includes("btn")) {
    return `/**
 * ${componentName} - Reusable button component with styling options.
 * @param {Object} props - Component props
 * @param {string} [props.label] - Button text
 * @param {Function} [props.onClick] - Click handler
 * @param {'primary'|'secondary'|'danger'} [props.variant] - Button style variant
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.isLoading] - Loading state
 * @returns {React.ReactElement} Button element
 */`;
  }
  if (lowerName.includes("card")) {
    return `/**
 * ${componentName} - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */`;
  }
  if (lowerName.includes("input") || lowerName.includes("textbox")) {
    return `/**
 * ${componentName} - Form input component with validation.
 * @param {Object} props - Component props
 * @param {'text'|'email'|'password'|'number'} [props.type] - Input type
 * @param {string} [props.value] - Current value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.error] - Error message if any
 * @returns {React.ReactElement} Input element
 */`;
  }
  if (lowerName.includes("select") || lowerName.includes("dropdown")) {
    return `/**
 * ${componentName} - Dropdown select component.
 * @param {Object} props - Component props
 * @param {Array} [props.options] - Available options
 * @param {string|number} [props.value] - Selected value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @returns {React.ReactElement} Select element
 */`;
  }
  if (lowerName.includes("checkbox")) {
    return `/**
 * ${componentName} - Checkbox input component.
 * @param {Object} props - Component props
 * @param {boolean} [props.checked] - Checked state
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.label] - Checkbox label
 * @returns {React.ReactElement} Checkbox element
 */`;
  }
  if (lowerName.includes("radio")) {
    return `/**
 * ${componentName} - Radio button component.
 * @param {Object} props - Component props
 * @param {boolean} [props.selected] - Selected state
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.label] - Radio label
 * @param {string|number} [props.value] - Radio value
 * @returns {React.ReactElement} Radio element
 */`;
  }
  if (lowerName.includes("layout")) {
    return `/**
 * ${componentName} - Layout wrapper for consistent page structure.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Page content
 * @param {React.ReactNode} [props.header] - Header component
 * @param {React.ReactNode} [props.sidebar] - Sidebar component
 * @param {React.ReactNode} [props.footer] - Footer component
 * @returns {React.ReactElement} Layout component
 */`;
  }
  if (lowerName.includes("navbar") || lowerName.includes("nav")) {
    return `/**
 * ${componentName} - Navigation header component.
 * @param {Object} props - Component props
 * @param {Array} [props.links] - Navigation links
 * @param {React.ReactNode} [props.logo] - Logo element
 * @returns {React.ReactElement} Navigation component
 */`;
  }
  if (lowerName.includes("footer")) {
    return `/**
 * ${componentName} - Footer component with site information.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Footer component
 */`;
  }
  if (lowerName.includes("list") || lowerName.includes("gallery")) {
    return `/**
 * ${componentName} - List/Gallery display component.
 * @param {Object} props - Component props
 * @param {Array} [props.items] - Items to display
 * @param {Function} [props.renderItem] - Item render function
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.emptyMessage] - Message when no items
 * @returns {React.ReactElement} List component
 */`;
  }
  if (lowerName.includes("table") || lowerName.includes("grid")) {
    return `/**
 * ${componentName} - Data table component.
 * @param {Object} props - Component props
 * @param {Array} [props.columns] - Table columns
 * @param {Array} [props.data] - Table data rows
 * @param {Object} [props.pagination] - Pagination config
 * @returns {React.ReactElement} Table component
 */`;
  }
  if (lowerName.includes("form")) {
    return `/**
 * ${componentName} - Form component with validation.
 * @param {Object} props - Component props
 * @param {Array} [props.fields] - Form fields
 * @param {Function} [props.onSubmit] - Form submission handler
 * @param {Object} [props.initialValues] - Initial field values
 * @returns {React.ReactElement} Form component
 */`;
  }
  if (lowerName.includes("loading") || lowerName.includes("spinner")) {
    return `/**
 * ${componentName} - Loading indicator component.
 * @param {Object} props - Component props
 * @param {string} [props.message] - Loading message
 * @param {'small'|'medium'|'large'} [props.size] - Spinner size
 * @returns {React.ReactElement} Loading component
 */`;
  }
  if (lowerName.includes("alert") || lowerName.includes("notification")) {
    return `/**
 * ${componentName} - Alert/Notification component.
 * @param {Object} props - Component props
 * @param {'info'|'success'|'warning'|'error'} [props.type] - Alert type
 * @param {string} [props.message] - Alert message
 * @param {Function} [props.onClose] - Close handler
 * @returns {React.ReactElement} Alert component
 */`;
  }
  if (lowerName.includes("avatar")) {
    return `/**
 * ${componentName} - User avatar component.
 * @param {Object} props - Component props
 * @param {string} [props.src] - Avatar image URL
 * @param {string} [props.name] - User name for fallback
 * @param {'small'|'medium'|'large'} [props.size] - Avatar size
 * @returns {React.ReactElement} Avatar component
 */`;
  }
  if (lowerName.includes("badge")) {
    return `/**
 * ${componentName} - Badge component for labels.
 * @param {Object} props - Component props
 * @param {string} [props.text] - Badge text
 * @param {string} [props.variant] - Badge style variant
 * @returns {React.ReactElement} Badge component
 */`;
  }
  if (lowerName.includes("pagination")) {
    return `/**
 * ${componentName} - Pagination component.
 * @param {Object} props - Component props
 * @param {number} [props.currentPage] - Current page
 * @param {number} [props.totalPages] - Total pages
 * @param {Function} [props.onPageChange] - Page change handler
 * @returns {React.ReactElement} Pagination component
 */`;
  }
  if (lowerName.includes("route") || lowerName.includes("protected")) {
    return `/**
 * ${componentName} - Route protection/access control component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Protected content
 * @param {string|string[]} [props.requiredRole] - Required role(s)
 * @param {Function} [props.fallback] - Fallback component
 * @returns {React.ReactElement} Protected route component
 */`;
  }

  // Default generic component JSDoc
  return `/**
 * ${componentName} - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */`;
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines = [];
  let functionsAdded = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match export default function/const or export function/const for components
    const exportMatch = line.match(/^export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+))/);

    if (exportMatch) {
      const componentName = exportMatch[1] || exportMatch[2];

      // Check if previous lines already have JSDoc
      let hasJSDoc = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (newLines[j] && (newLines[j].includes("/**") || newLines[j].includes("*/"))) {
          hasJSDoc = true;
          break;
        }
      }

      if (!hasJSDoc && componentName) {
        const jsDoc = getComponentJSDoc(componentName);
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
const componentFiles = glob
  .sync(path.join(__dirname, "..", "src", "components", "**", "*.tsx"))
  .filter((f) => !f.includes("index.tsx") && !f.includes(".test."));

console.log(`\n📝 Adding JSDoc to ${componentFiles.length} component files...\n`);

let totalUpdated = 0;
let totalFunctionsDocumented = 0;

for (const file of componentFiles) {
  try {
    const count = processFile(file);
    if (count > 0) {
      totalUpdated++;
      totalFunctionsDocumented += count;
      const relativePath = path.relative(path.join(__dirname, ".."), file);
      console.log(`  ✓ ${relativePath.substring(0, 60)} (+${count} functions)`);
    }
  } catch (e) {
    console.error(`  ✗ Error processing ${file}: ${e.message}`);
  }
}

console.log(
  `\n✅ Updated ${totalUpdated} component files, documented ${totalFunctionsDocumented} functions\n`,
);
