const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Packaging Soulful Sessions for Chrome Web Store...\n');

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.error('❌ Error: dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Create package directory
const packageDir = 'package';
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
}
fs.mkdirSync(packageDir);

// Files and folders to include
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'options.html',
  'options.css',
  'blocked.html',
  'RubikSprayPaint-Regular.ttf'
];

const foldersToCopy = [
  'dist',
  'assets'
];

// Copy files
console.log('📄 Copying files...');
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(packageDir, file));
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ⚠ ${file} not found, skipping`);
  }
});

// Copy folders recursively
console.log('\n📁 Copying folders...');
foldersToCopy.forEach(folder => {
  if (fs.existsSync(folder)) {
    copyFolderRecursive(folder, path.join(packageDir, folder));
    console.log(`  ✓ ${folder}/`);
  } else {
    console.log(`  ⚠ ${folder}/ not found, skipping`);
  }
});

// Create zip file
console.log('\n🗜️  Creating zip file...');
const zipName = 'soulful-sessions.zip';
if (fs.existsSync(zipName)) {
  fs.unlinkSync(zipName);
}

try {
  // Use PowerShell Compress-Archive on Windows
  execSync(`powershell Compress-Archive -Path "${packageDir}/*" -DestinationPath "${zipName}"`, { stdio: 'inherit' });
  console.log(`\n✅ Package created: ${zipName}`);
  console.log(`📊 Size: ${(fs.statSync(zipName).size / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  process.exit(1);
}

// Clean up package directory
fs.rmSync(packageDir, { recursive: true, force: true });

console.log('\n🎉 Ready to upload to Chrome Web Store!');

// Helper function to copy folders recursively
function copyFolderRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}
