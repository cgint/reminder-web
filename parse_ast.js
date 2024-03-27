const svelte = require('svelte/compiler');
const fs = require('fs');
const path = require('path');

const svelteFiles = [];
const componentGraph = {};

function readSvelteFiles(directory) {
  fs.readdirSync(directory).forEach(file => {
    const absolutePath = path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      readSvelteFiles(absolutePath);
    } else if (absolutePath.endsWith('.svelte')) {
      svelteFiles.push(absolutePath);
    }
  });
}

readSvelteFiles('./src/');

svelteFiles.forEach(file => {
  const sourceCode = fs.readFileSync(file, 'utf8');
  const parsed = svelte.parse(sourceCode);
  const imports = parsed.instance.content.body.filter(node => node.type === 'ImportDeclaration');
  const components = imports.map(importNode => {
    const sourceValue = importNode.source.value;
    if (sourceValue.endsWith('.svelte')) {
      return path.basename(sourceValue, '.svelte');
    }
  }).filter(Boolean);
  componentGraph[path.basename(file, '.svelte')] = components;
});

function drawAsciiTree(node, prefix = '') {
  console.log(prefix + node);
  if (componentGraph[node] && componentGraph[node].length) {
    componentGraph[node].forEach((child, index, array) => {
      const connector = index === array.length - 1 ? '└─' : '├─';
      drawAsciiTree(child, prefix + connector);
    });
  }
}

console.log(componentGraph);

// Refine the script to accurately identify the root component by checking which component is not imported by any others.
let allComponents = new Set(Object.keys(componentGraph));
let importedComponents = new Set();
Object.values(componentGraph).forEach(components => {
  components.forEach(component => importedComponents.add(component));
});
let rootComponents = [...allComponents].filter(x => !importedComponents.has(x));

if (rootComponents.length > 0) {
  rootComponents.forEach(rootComponent => {
    console.log(`Drawing ASCII tree for root component: ${rootComponent}`);
    drawAsciiTree(rootComponent);
  });
} else {
  console.log("No root component found.");
}
