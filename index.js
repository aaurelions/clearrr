#!/usr/bin/env node

import chalk from "chalk";
import fg from "fast-glob";
import { rmdirSync } from "fs";
import getFolderSize from "get-folder-size";
import { resolve } from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

const PRESETS = {
  node: [
    "node_modules",
    ".next",
    ".nuxt",
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
  all: [
    "node_modules",
    ".next",
    ".nuxt",
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
  .usage("Usage: $0 [dir] [options]")
  .positional("dir", {
    describe: "Root folder to scan",
    default: ".",
  })
  .option("preset", {
    describe: "Preset for folders to delete",
    choices: ["node", "python", "php", "rust", "all"],
    default: "all",
  })
  .option("patterns", {
    describe: "Override preset with custom comma-list",
    type: "string",
  })
  .option("dry-run", {
    describe: "Explicit dry-run",
    type: "boolean",
    default: true,
  })
  .option("confirm", {
    describe: "Actually delete matched folders",
    type: "boolean",
    default: false,
  })
  .option("recursive", {
    describe: "Enable recursive search",
    type: "boolean",
    default: true,
  })
  .help().argv;

async function main() {
  const dir = resolve(process.cwd(), argv.dir);
  const basePatterns = argv.patterns
    ? argv.patterns.split(",")
    : PRESETS[argv.preset];
  const patterns = argv.recursive
    ? basePatterns.map((p) => `**/${p}`)
    : basePatterns;
  const isDryRun = argv.confirm ? false : argv.dryRun;

  console.log(chalk.green(`🧹 clearrr preset: ${argv.preset}`));
  console.log(
    chalk.gray(`📂 Searching in: ${dir}${argv.recursive ? " (recursively)" : ""}`)
  );
  console.log(chalk.gray(`🧩 Patterns: ${patterns.join(",")}`));
  console.log("");

  const entries = await fg(patterns, {
    cwd: dir,
    onlyDirectories: true,
    deep: Infinity,
    ignore: ["**/node_modules/.bin/**", "**/.git/**"],
    absolute: true,
  });

  let totalSize = 0;

  for (const entry of entries) {
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
        rmdirSync(entry, { recursive: true });
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
    console.log(chalk.blue("💡 To confirm deletion, re-run with --confirm"));
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
