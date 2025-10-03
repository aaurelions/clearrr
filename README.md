# clearrr

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/banner.png">

**🧹 Effortlessly clear project junk, system caches, and find large files — safely, fast, and with full control.**

---

## ✨ What is clearrr?

`clearrr` is a simple but powerful CLI tool to **find and remove large, temporary folders and files**.

It has three main functions:

1.  **Clean Projects:** Remove build artifacts and dependency folders like `node_modules`, `.venv`, `dist`, `build`, and `target` to free up gigabytes across all your projects.
2.  **Clean System Caches:** The `cache` command safely removes gigabytes of disposable cache files from your user home directory, targeting tools like Xcode, npm, pip, Docker, browsers, and more.
3.  **Find Large Files & Folders:** The `large` command scans any directory and shows you a top-10 list of the largest files or folders, helping you pinpoint what's taking up your disk space.

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

#### 3. To find what's taking up space:

```bash
# Find the 10 largest files in the current directory
npx clearrr large files 10

# Find the 15 largest folders in your home directory
npx clearrr large folders 15 ~/
```

---

## ✅ Features

- 🏠 **System Cache Cleaning** — A dedicated `cache` command to clear gigabytes from your user home directory.
- 📊 **Disk Usage Analysis** — Find the largest files or folders in any directory to see what's using your space.
- 🗂️ **Recursive Project Scanning** — Finds temp folders deep within any path.
- 🔒 **Dry-run by Default** — See what will be deleted & how much space you’ll free.
- ⚙️ **Smart Presets** — Targets for Node, Python, PHP, and Rust projects.
- ⚡️ **Fast** — Powered by `fast-glob` and includes a progress spinner for long operations.
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

### 3. Finding Large Files & Folders

The `large` command is a disk analysis tool that helps you find what's taking up the most space. It does not delete anything.

**Syntax:** `npx clearrr large <type> [dir] [count]`

- `<type>`: Must be either `files` or `folders`.
- `[dir]`: Optional directory to scan (default: current directory).
- `[count]`: Optional number of items to show (default: 10).

**Example: Find the 10 largest files**
Scan the current folder and its subfolders for the largest files.

```bash
npx clearrr large files
```

**Example: Find the 5 largest folders in `~/Library`**
This can help you identify bloated application support or cache folders.

```bash
npx clearrr large folders ~/Library 5
```

---

## 📁 Presets (for cleaning)

| Preset            | Folders Targeted                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `node`            | `node_modules`, `.next`, `.nuxt`, `.turbo`, `.parcel-cache`, `.cache`, `dist`, `build`                                |
| `python`          | `venv`, `.venv`, `__pycache__`, `.mypy_cache`, `.pytest_cache`, `build`, `dist`, `.tox`                               |
| `php`             | `vendor`                                                                                                              |
| `rust`            | `target`                                                                                                              |
| `all` _(default)_ | Everything in `node` + `python` + `php` + `rust`.                                                                     |
| **`cache`**       | `~/.cache`, `~/Library/Caches`, `Xcode DerivedData`, `npm`, `pip`, `Docker`, `Yarn`, `browser caches`, and many more. |

---

## 🧯 Safety

- ✅ **Dry-run by default** for cleaning commands — nothing is deleted unless `--confirm` is set.
- ✅ The `large` command is read-only and never deletes files.
- ✅ Targets only well-known disposable directories.
- ✅ Does not touch `.git`, `.vscode`, `.idea`, or any source folders.
- ✅ Reports total disk space to be freed up before asking for confirmation.

---

## 🛠️ Options (for cleaning)

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

**Cleaning Command:**

```bash
🧹 clearrr preset: node
📂 Searching in: /Users/you/Developer
🧩 Patterns: node_modules,.next,.nuxt,.turbo,.parcel-cache,.cache,dist,build

[dry-run] Would delete: /Users/you/Developer/project1/node_modules (242.3 MB)
[dry-run] Would delete: /Users/you/Developer/project2/.next (58.1 MB)

✅ Would free approximately 300.4 MB.

💡 To confirm deletion, re-run with --confirm
```

**Large Files Command:**

```bash
🔎 Finding the 10 largest folders in /Users/you
This may take a few moments...
✔ Scan complete. Filtering for the most specific paths...

Top 10 largest files:
17.0 GB    /Users/you/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw
2.3 GB     /Users/you/Library/Application Support/BraveSoftware/Brave-Browser/Default/Favicons
1.7 GB     /Users/you/Library/Application Support/tts/tts_models--.../model.pth
...
```
