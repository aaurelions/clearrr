#!/usr/bin/env node

import chalk from "chalk";
import fg from "fast-glob";
import { rmSync } from "fs";
import { readdir, stat } from "fs/promises";
import getFolderSize from "get-folder-size";
import ora from "ora";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
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

// --- Command Definitions ---
const argv = yargs(hideBin(process.argv))
  .usage("Usage: clearrr [command]")
  .command(
    "$0 [dir]",
    "Clean project artifacts in a directory",
    (yargs) => {
      yargs.positional("dir", {
        describe: "Root folder to scan for project files",
        default: ".",
      });
    },
    (argv) => main(argv) // Route to the original main function
  )
  .command(
    "cache",
    "Clean common cache directories in your home folder (~/)",
    () => {},
    (argv) => main(argv) // Also route to the original main function
  )
  .command(
    "large <type> [dir] [count]",
    "Find the largest files or folders",
    (yargs) => {
      yargs
        .positional("type", {
          describe: "The type of item to search for",
          choices: ["files", "folders"],
        })
        .positional("dir", {
          describe: "The directory to scan",
          type: "string",
          default: ".",
        })
        .positional("count", {
          describe: "The number of items to list",
          type: "number",
          default: 10,
        });
    },
    (argv) => handleLargeCommand(argv)
  )
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
    describe:
      "List folders that would be deleted without actually deleting them",
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
  .demandCommand(1, "You must provide a valid command.")
  .help().argv;

// --- New Handler for the 'large' command ---
async function handleLargeCommand(argv) {
  const targetDir = resolve(process.cwd(), argv.dir);
  console.log(
    chalk.green(
      `🔎 Finding the ${argv.count} largest ${argv.type} in ${chalk.bold(
        targetDir
      )}`
    )
  );
  console.log(chalk.gray("This may take a few moments..."));

  // Find a large pool of items to ensure we have enough candidates
  // after the filtering process.
  const sampleSize = argv.count * 10;
  const topItems = [];
  const spinner = ora("Scanning directories...").start();

  function updateTopItems(newItem) {
    if (topItems.length < sampleSize) {
      topItems.push(newItem);
      topItems.sort((a, b) => b.size - a.size);
    } else {
      const smallestInTop = topItems[sampleSize - 1];
      if (newItem.size > smallestInTop.size) {
        topItems.pop();
        topItems.push(newItem);
        topItems.sort((a, b) => b.size - a.size);
      }
    }
  }

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (err) {
      return; // Ignore permission errors
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (argv.type === "folders") {
          try {
            const size = await getFolderSize.loose(fullPath);
            updateTopItems({ path: fullPath, size });
          } catch (err) {}
        }
        // Exclude common cache/artifact folders from deep scans for performance
        if (
          !entry.name.includes("node_modules") &&
          !entry.name.includes(".git")
        ) {
          await walk(fullPath);
        }
      } else if (entry.isFile() && argv.type === "files") {
        try {
          const stats = await stat(fullPath);
          updateTopItems({ path: fullPath, size: stats.size });
        } catch (err) {}
      }
    }
  }

  await walk(targetDir);
  spinner.succeed("Scan complete. Filtering for the most specific paths...");

  let finalTopItems = topItems;

  if (argv.type === "folders" && topItems.length > 0) {
    // If a child folder is 80% or more of its parent's size,
    // we consider the parent redundant and will hide it from the list.
    const SIMILARITY_THRESHOLD = 0.8;

    const itemMap = new Map(topItems.map((item) => [item.path, item]));
    const pathsToKeep = new Set(topItems.map((item) => item.path));

    // Iterate through all found items to check for redundancy
    for (const item of topItems) {
      const parentPath = dirname(item.path);

      // Check if this item's parent is also in our list of large folders
      if (itemMap.has(parentPath)) {
        const parentItem = itemMap.get(parentPath);

        // If the child's size is a huge portion of the parent's size,
        // the parent path is not informative. Mark it for removal.
        if (item.size / parentItem.size > SIMILARITY_THRESHOLD) {
          pathsToKeep.delete(parentPath);
        }
      }
    }

    // Filter the original list to get our final, informative results
    // and then slice to the desired count.
    finalTopItems = topItems
      .filter((item) => pathsToKeep.has(item.path))
      .slice(0, argv.count);
  } else {
    // For files, or if no folders were found, just take the top N
    finalTopItems = topItems.slice(0, argv.count);
  }

  console.log("");

  if (finalTopItems.length === 0) {
    console.log(chalk.blue("✨ No items found."));
    return;
  }

  console.log(
    chalk.underline(`Top ${finalTopItems.length} largest ${argv.type}:`)
  );
  finalTopItems.forEach((item) => {
    console.log(
      `${chalk.yellow(formatBytes(item.size).padEnd(10))} ${chalk.cyan(
        item.path
      )}`
    );
  });
}

// --- Original Main Function (for cleaning) ---
async function main(argv) {
  const command = argv._[0] === "cache" ? "cache" : "project";
  const isCacheMode = command === "cache";

  const dir = isCacheMode ? homedir() : resolve(process.cwd(), argv.dir || ".");
  const presetKey = isCacheMode ? "cache" : argv.preset;

  const basePatterns = argv.patterns
    ? argv.patterns.split(",")
    : PRESETS[presetKey];

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
    deep: isCacheMode ? 5 : Infinity,
    ignore: ["**/node_modules/.bin/**", "**/.git/**"],
    absolute: true,
    followSymbolicLinks: false,
  });

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
