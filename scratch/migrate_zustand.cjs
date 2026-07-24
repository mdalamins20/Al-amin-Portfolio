const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(componentsDir);
files.push(path.join(__dirname, '../App.tsx')); // if any context still there
files.push(path.join(__dirname, '../index.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Paths
  const isNested = file.includes('AdminDashboard') || file.includes('hooks');
  const storePathPrefix = isNested ? '../stores' : './stores';

  // useProfile
  content = content.replace(/import\s+\{\s*useProfile\s*\}\s+from\s+['"](?:\.\.\/|\.\/)ProfileContext['"];/g, `import { useProfileStore } from '${storePathPrefix}/useProfileStore';`);
  content = content.replace(/useProfile\(\)/g, 'useProfileStore()');

  // useData
  content = content.replace(/import\s+\{\s*useData\s*\}\s+from\s+['"](?:\.\.\/|\.\/)DataContext['"];/g, `import { useDataStore } from '${storePathPrefix}/useDataStore';`);
  content = content.replace(/useData\(\)/g, 'useDataStore()');

  // useAuth
  content = content.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+['"](?:\.\.\/|\.\/)AuthContext['"];/g, `import { useAuthStore } from '${storePathPrefix}/useAuthStore';`);
  content = content.replace(/useAuth\(\)/g, 'useAuthStore()');

  // useTheme - handles multiple imports like ACCENT_COLORS
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/|\.\/)ThemeContext['"];/g, (match, p1) => {
    let newImports = [];
    if (p1.includes('useTheme')) {
      newImports.push(`import { useThemeStore } from '${storePathPrefix}/useThemeStore';`);
    }
    const otherImports = p1.replace('useTheme', '').split(',').map(s => s.trim()).filter(Boolean);
    if (otherImports.length > 0) {
      newImports.push(`import { ${otherImports.join(', ')} } from '${storePathPrefix}/useThemeStore';`);
    }
    return newImports.join('\n');
  });
  content = content.replace(/useTheme\(\)/g, 'useThemeStore()');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
