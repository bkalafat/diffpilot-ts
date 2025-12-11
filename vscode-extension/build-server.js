/**
 * Build script for bundling the MCP server into the VS Code extension.
 * 
 * This script:
 * 1. Builds the TypeScript MCP server
 * 2. Copies the compiled server to the extension's server folder
 * 3. Copies necessary dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_SRC = path.join(ROOT_DIR, 'dist');
const SERVER_DEST = path.join(__dirname, 'server');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

console.log('🔨 Building MCP server...');

// Step 1: Build the TypeScript server
try {
    execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('✅ Server compiled successfully');
} catch (error) {
    console.error('❌ Failed to compile server');
    process.exit(1);
}

// Step 2: Create server directory
if (fs.existsSync(SERVER_DEST)) {
    fs.rmSync(SERVER_DEST, { recursive: true });
}
fs.mkdirSync(SERVER_DEST, { recursive: true });

// Step 3: Copy compiled files
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    copyDir(SERVER_SRC, SERVER_DEST);
    console.log('✅ Server files copied');
} catch (error) {
    console.error('❌ Failed to copy server files:', error.message);
    process.exit(1);
}

// Step 4: Create a minimal package.json for the bundled server
const serverPackage = require(PACKAGE_JSON);
const bundledPackage = {
    name: 'diffpilot-server',
    version: serverPackage.version,
    type: 'module',
    main: 'index.js',
    dependencies: serverPackage.dependencies
};

fs.writeFileSync(
    path.join(SERVER_DEST, 'package.json'),
    JSON.stringify(bundledPackage, null, 2)
);
console.log('✅ Server package.json created');

// Step 5: Copy node_modules for dependencies (recursively handles all transitive deps)
const nodeModulesSrc = path.join(ROOT_DIR, 'node_modules');
const nodeModulesDest = path.join(SERVER_DEST, 'node_modules');

/**
 * Recursively copy a dependency and all its transitive dependencies
 */
function copyDependencyWithTransitive(depName, nodeModulesSrc, nodeModulesDest, copiedDeps = new Set()) {
    // Avoid circular dependencies and already copied deps
    if (copiedDeps.has(depName)) {
        return;
    }
    
    const depSrc = path.join(nodeModulesSrc, depName);
    const depDest = path.join(nodeModulesDest, depName);
    
    if (!fs.existsSync(depSrc)) {
        return;
    }
    
    // Mark as copied before processing to handle circular deps
    copiedDeps.add(depName);
    
    // Copy the dependency
    if (!fs.existsSync(depDest)) {
        copyDir(depSrc, depDest);
        console.log(`  📦 Copied ${depName}`);
    }
    
    // Recursively copy transitive dependencies
    const depPackagePath = path.join(depSrc, 'package.json');
    if (fs.existsSync(depPackagePath)) {
        const depPackage = JSON.parse(fs.readFileSync(depPackagePath, 'utf8'));
        const transitiveDeps = Object.keys(depPackage.dependencies || {});
        
        for (const transDep of transitiveDeps) {
            copyDependencyWithTransitive(transDep, nodeModulesSrc, nodeModulesDest, copiedDeps);
        }
    }
}

if (fs.existsSync(nodeModulesSrc)) {
    // Only copy production dependencies (and all their transitive deps recursively)
    const deps = Object.keys(serverPackage.dependencies || {});
    fs.mkdirSync(nodeModulesDest, { recursive: true });
    
    const copiedDeps = new Set();
    for (const dep of deps) {
        copyDependencyWithTransitive(dep, nodeModulesSrc, nodeModulesDest, copiedDeps);
    }
    console.log('✅ Dependencies copied');
}

console.log('\n🎉 Server bundled successfully!');
console.log(`   Output: ${SERVER_DEST}`);
