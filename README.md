# clearrr

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/banner.png">

**🧹 Effortlessly clear project junk and system caches — safely, fast, and with full control.**

---

## ✨ What is clearrr?

`clearrr` is a simple but powerful CLI tool to **find and remove large, temporary folders**.

It has two main functions:

1.  **Clean Projects:** Remove build artifacts and dependency folders like `node_modules`, `.venv`, `dist`, `build`, and `target` to free up gigabytes across all your projects.
2.  **Clean System Caches:** The `cache` command safely removes gigabytes of disposable cache files from your user home directory, targeting tools like Xcode, npm, pip, Homebrew, browsers, and more.

It’s safe by design:

- **Dry-run by default:** Nothing is deleted unless you confirm.
- **Powerful presets** for projects and system caches.
- Runs anywhere instantly with `npx`.

---

## ⚡️ Quick Start

#### 1. To clean a project directory:

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/screenshot.png">

```bash
# See what would be deleted in the current folder
npx clearrr

# Actually delete the files
npx clearrr --confirm
```

#### 2. To clean your system's user caches:

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/screenshot2.png">

```bash
# See how much space you can reclaim from global caches
npx clearrr cache

# Perform the cleanup
npx clearrr cache --confirm
```

---

## ✅ Features

- 🏠 **System Cache Cleaning** — A dedicated `cache` command to clear gigabytes from your user home directory.
- 🗂️ **Recursive Project Scanning** — Finds temp folders deep within any path.
- 🔒 **Dry-run by Default** — See what will be deleted & how much space you’ll free.
- ⚙️ **Smart Presets** — Targets for Node, Python, PHP, and Rust projects.
- ⚡️ **Fast** — Powered by `fast-glob`.
- 🧩 **Custom Patterns** — Override presets with your own list.
- 🧹 **Safe** — Never touches `.git`, source files, or config folders.

---

## 📦 Install (optional)

You can run with `npx` — **no install needed**.

Or install globally for daily use:

```bash
npm install -g clearrr
```

---

## 🏁 Usage

### 1. Cleaning Project Folders

This is the default command. It scans a directory for build artifacts and dependencies.

**Dry-run example (default)**
Check what would be deleted for Node projects in a specific monorepo:

```bash
npx clearrr ./my-monorepo --preset=node
```

**Actually delete (must confirm)**
Delete safely by adding the `--confirm` flag:

```bash
npx clearrr ./my-monorepo --preset=node --confirm
```

**Custom patterns:**

```bash
npx clearrr . --patterns="node_modules,dist,build,.cache" --confirm
```

### 2. Cleaning Global System Caches

The `cache` command scans your user home directory (`~/`) for common application and development tool caches that are safe to delete.

**Dry-run the cache cleaner:**

```bash
npx clearrr cache
```

**Confirm to free up gigabytes of space:**

```bash
npx clearrr cache --confirm
```

---

## 📁 Presets

| Preset            | Folders Targeted                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `node`            | `node_modules`, `.next`, `.nuxt`, `.turbo`, `.parcel-cache`, `.cache`, `dist`, `build`                                  |
| `python`          | `venv`, `.venv`, `__pycache__`, `.mypy_cache`, `.pytest_cache`, `build`, `dist`, `.tox`                                 |
| `php`             | `vendor`                                                                                                                |
| `rust`            | `target`                                                                                                                |
| `all` _(default)_ | Everything in `node` + `python` + `php` + `rust`.                                                                       |
| **`cache`**       | `~/.cache`, `~/Library/Caches`, `Xcode DerivedData`, `npm`, `pip`, `Homebrew`, `Yarn`, `browser caches`, and many more. |

---

## 🧯 Safety

- ✅ **Dry-run by default** — nothing is deleted unless `--confirm` is set.
- ✅ Targets only well-known disposable directories.
- ✅ Does not touch `.git`, `.vscode`, `.idea`, or any source folders.
- ✅ Reports total disk space to be freed up before asking for confirmation.

---

## 🛠️ Options

| Option             | Description                               | Default       |
| ------------------ | ----------------------------------------- | ------------- |
| `[dir]`            | Root folder to scan (project mode only)   | `.` (current) |
| `--preset`         | `node`, `python`, `php`, `rust`, or `all` | `all`         |
| `--patterns`       | Override preset with custom comma-list    | —             |
| `--dry-run`        | Explicit dry-run                          | `true`        |
| `--confirm`        | Actually delete matched folders           | `false`       |
| `--[no-]recursive` | Enable/disable recursive search           | `true`        |

---

## 📊 Example output

```bash
🧹 clearrr preset: node
📂 Searching in: /Users/you/Developer
🧩 Patterns: node_modules,.next,.nuxt,.turbo,.parcel-cache,.cache,dist,build

[dry-run] Would delete: /Users/you/Developer/project1/node_modules (242.3 MB)
[dry-run] Would delete: /Users/you/Developer/project2/.next (58.1 MB)

✅ Would free approximately 300.4 MB.

💡 To confirm deletion, re-run with --confirm
```
