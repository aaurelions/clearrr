#!/usr/bin/env node

import chalk from "chalk";
import fg from "fast-glob";
import { rmSync } from "fs";
import getFolderSize from "get-folder-size";
import { homedir } from "os";
import { resolve } from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

const PRESETS = {
  // Project-specific presets
  node: [
    "node_modules",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    ".parcel-cache",
    ".cache",
    "dist",
    "build",
  ],
  python: [
    "venv",
    ".venv",
    "__pycache__",
    ".mypy_cache",
    ".pytest_cache",
    "build",
    "dist",
    ".tox",
  ],
  php: ["vendor"],
  rust: ["target"],

  // Home directory cache preset (Production Ready)
  cache: [
    // --- General OS Caches ---
    ".cache", // Standard for many Linux/macOS apps (e.g., pip, huggingface)
    "Library/Caches", // The primary cache location on macOS
    "AppData/Local/Temp", // Windows temporary files
    "AppData/Local/*-cache", // Common pattern for app caches on Windows
    "AppData/Local/*Cache", // Alternate common pattern on Windows

    // --- Package Manager Caches ---
    // Node.js
    ".npm/_cacache",
    ".npm/_npx",
    ".npm/_logs",
    ".yarn/cache",
    ".yarn/unplugged",
    // Python
    ".local/share/uv", // UV package manager
    // Rust
    ".cargo/registry/cache",
    ".cargo/registry/index",
    ".cargo/registry/src",
    // Go
    "go/pkg/mod",
    "go/pkg/sumdb",
    // Ruby
    ".gem/cache",
    // Java / JVM
    ".gradle/caches",
    ".m2/repository",
    // Mobile / macOS Dev
    ".cocoapods/repos",
    "Library/Developer/Xcode/DerivedData",
    "Library/Developer/CoreSimulator/Caches",
    ".swiftpm/cache",
    // PHP
    ".composer/cache",

    // --- Development Tool Caches ---
    ".docker/buildx/cache", // Docker buildx cache (safe to remove)
    ".expo/versions-cache", // Expo (React Native) cache
    ".expo/native-modules-cache",
    ".foundry/cache", // Foundry (Solidity) cache
    ".bun/install/cache", // Bun runtime cache
    ".local/share/pnpm/store", // pnpm's global content-addressable store

    // --- Application Caches ---
    // Browsers (Note: This may log you out of some websites)
    ".config/google-chrome/Default/Cache",
    ".config/BraveSoftware/Brave-Browser/Default/Cache",
    "Library/Application Support/Google/Chrome/Default/Application Cache",
    "AppData/Local/Google/Chrome/User Data/Default/Cache",
    // AI Tools (Models themselves are NOT deleted)
    ".cache/huggingface",
    ".cache/torch",
    // Others
    ".local/share/Trash", // System trash files
  ],

  // Combined project-level preset
  all: [
    // Duplicates the 'node', 'python', 'php', 'rust' presets
    "node_modules",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    ".parcel-cache",
    ".cache",
    "dist",
    "build",
    "venv",
    ".venv",
    "__pycache__",
    ".mypy_cache",
    ".pytest_cache",
    "build",
    "dist",
    ".tox",
    "vendor",
    "target",
  ],
};

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [command] [dir] [options]")
  .command(
    "$0 [dir]",
    "Clean project dependencies and build artifacts in a directory",
    (yargs) => {
      yargs.positional("dir", {
        describe: "Root folder to scan",
        default: ".",
      });
    }
  )
  .command("cache", "Clean common cache directories in your home folder (~/)")
  .option("preset", {
    describe: "Preset for folders to delete",
    choices: ["node", "python", "php", "rust", "all"],
    default: "all",
  })
  .option("patterns", {
    describe: "Override preset with custom comma-separated list",
    type: "string",
  })
  .option("dry-run", {
    describe: "List files that would be deleted without actually deleting them",
    type: "boolean",
    default: true,
  })
  .option("confirm", {
    describe: "Confirm and actually delete matched folders",
    type: "boolean",
    default: false,
  })
  .option("recursive", {
    describe: "Enable recursive search for project cleaning",
    type: "boolean",
    default: true,
  })
  .demandCommand(
    0,
    1,
    "You must specify a command: either a directory or 'cache'."
  )
  .help().argv;

async function main() {
  const command = argv._[0];
  const isCacheMode = command === "cache";

  const dir = isCacheMode ? homedir() : resolve(process.cwd(), argv.dir || ".");
  const presetKey = isCacheMode ? "cache" : argv.preset;

  const basePatterns = argv.patterns
    ? argv.patterns.split(",")
    : PRESETS[presetKey];

  // In project mode, search recursively. In cache mode, paths are absolute from home.
  const patterns =
    !isCacheMode && argv.recursive
      ? basePatterns.map((p) => `**/${p}`)
      : basePatterns;

  const isDryRun = argv.confirm ? false : argv.dryRun;

  console.log(chalk.green(`🧹 clearrr preset: ${chalk.bold(presetKey)}`));
  if (isCacheMode) {
    console.log(
      chalk.gray(`📂 Searching for caches in your home directory: ${dir}`)
    );
  } else {
    console.log(
      chalk.gray(
        `📂 Searching in: ${dir}${argv.recursive ? " (recursively)" : ""}`
      )
    );
  }
  console.log(chalk.gray(`🧩 Patterns: ${patterns.join(",")}`));
  console.log("");

  const entries = await fg(patterns, {
    cwd: dir,
    onlyDirectories: true,
    deep: isCacheMode ? 5 : Infinity, // Limit depth for safety in home dir
    ignore: ["**/node_modules/.bin/**", "**/.git/**"],
    absolute: true,
    followSymbolicLinks: false,
  });

  // Sort by path length to ensure parents are processed first, then filter out children.
  const sortedEntries = entries.sort((a, b) => a.length - b.length);
  const uniqueEntries = [];
  for (const entry of sortedEntries) {
    if (!uniqueEntries.some((parent) => entry.startsWith(parent + "/"))) {
      uniqueEntries.push(entry);
    }
  }

  if (uniqueEntries.length === 0) {
    console.log(chalk.blue("✨ All clean! No matching folders found."));
    return;
  }

  let totalSize = 0;

  for (const entry of uniqueEntries) {
    try {
      const size = await getFolderSize.loose(entry);
      totalSize += size;
      if (isDryRun) {
        console.log(
          chalk.yellow(
            `[dry-run] Would delete: ${entry} (${formatBytes(size)})`
          )
        );
      } else {
        console.log(chalk.red(`Deleting: ${entry} (${formatBytes(size)})`));
        rmSync(entry, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(chalk.red(`Error processing ${entry}: ${err.message}`));
    }
  }

  console.log("");
  if (isDryRun) {
    console.log(
      chalk.green(`✅ Would free approximately ${formatBytes(totalSize)}.`)
    );
    console.log("");
    console.log(
      chalk.blue(
        `💡 To perform the deletion, re-run with the ${chalk.bold(
          "--confirm"
        )} flag.`
      )
    );
  } else {
    console.log(
      chalk.green(`✅ Freed approximately ${formatBytes(totalSize)}.`)
    );
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
