const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(standaloneDir)) {
  console.warn("prepare-standalone: .next/standalone not found — run next build first");
  process.exit(0);
}

copyRecursive(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
copyRecursive(path.join(root, "public"), path.join(standaloneDir, "public"));

console.log("prepare-standalone: copied static assets into standalone output");
