# clearrr

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/banner.png">

**🧹 Effortlessly clear heavy temp folders — safely, fast, and with full control.**

<img src="https://raw.githubusercontent.com/aaurelions/clearrr/refs/heads/main/screenshot.png">

---

## ✨ What is clearrr?

`clearrr` is a simple but powerful CLI tool to **find and remove large build and cache folders**
like `node_modules`, `.venv`, `__pycache__`, `dist`, `build`, `.next` —
freeing gigabytes of disk space across all your projects.

It’s safe by default:

- **Dry-run by default:** Nothing is deleted unless you confirm.
- **Presets for Node.js, Python, or all.**
- Runs anywhere with `npx`.

---

## ⚡️ Quick start

```bash
npx clearrr [dir] [--preset=node|python|php|rust|all] [--confirm]
```

---

## ✅ Features

- 🗂️ **Recursively finds** temp folders under any path
- 🔒 **Dry-run by default** — see what will be deleted & how much space you’ll free
- - ⚙️ **Presets** for Node, Python, PHP, and Rust projects, or all
- ⚡️ **Fast** — powered by `fast-glob`
- 🧩 **Custom patterns** — override with your own
- 🧹 **Safe** — never touches `.git`, source files, or config folders

---

## 📦 Install (optional)

You can run with `npx` — **no install needed**.

Or install globally for daily use:

```bash
npm install -g clearrr
```

---

## 🏁 Usage

**Dry-run example (default)**
Check what would be deleted for Node projects:

```bash
npx clearrr ./my-monorepo --preset=node
```

---

**Actually delete (must confirm)**
Delete safely with `--confirm`:

```bash
npx clearrr ./my-monorepo --preset=node --confirm
```

---

**Python project example:**

```bash
npx clearrr ./my-data-scripts --preset=python --confirm
```

---

**Custom patterns:**

```bash
npx clearrr . --patterns="node_modules,dist,build,.cache" --confirm
```

---

## 📁 Presets

| Preset            | Folders deleted                                                                         |
| ----------------- | --------------------------------------------------------------------------------------- |
| `node`            | `node_modules`, `.next`, `.nuxt`, `.turbo`, `.parcel-cache`, `.cache`, `dist`, `build`  |
| `python`          | `venv`, `.venv`, `__pycache__`, `.mypy_cache`, `.pytest_cache`, `build`, `dist`, `.tox` |
| `php`             | `vendor`                                                                                |
| `rust`            | `target`                                                                                |
| `all` _(default)_ | Everything in `node` + `python` + `php` + `rust`                                        |

---

## 🧯 Safety

- ✅ **Dry-run by default** — nothing is deleted unless `--confirm` is set.
- ✅ Does not touch `.git`, `.vscode`, `.idea`, or any source folders.
- ✅ Reports total disk space to free up before deletion.

---

## 🛠️ Options

| Option             | Description                               | Default       |
| ------------------ | ----------------------------------------- | ------------- |
| `[dir]`            | Root folder to scan                       | `.` (current) |
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
