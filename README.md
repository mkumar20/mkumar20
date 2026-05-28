# 🚀 The Developer's Sandbox (Mono-Repo)

Welcome to your central Mono-Repo workspace! This is your creative laboratory for capturing project ideas, sketching architectural designs, experimenting with boilerplates, and housing fully realized applications.

This repository is optimized for quick prototyping, standardized documentation, and automated scaffolding, overseen by a high-fidelity **Interactive Project Dashboard**.

---

## 📂 Repository Structure

The mono-repo is organized systematically to keep your codebase clean and structured:

```text
├── backlog/           # 💡 Project specifications, ideas, and system architecture drafts (Markdown)
├── projects/          # 🏗️ Active and completed codebases (web apps, extensions, tools)
├── templates/         # 🧬 Standard boilerplates (Vanilla HTML/JS, APIs, Chrome Manifest V3)
├── dashboard/         # 🎛️ Local dashboard application (zero-dependency project command center)
├── scripts/           # ⚡ Automation and development scripts
└── README.md          # 📖 Master workspace documentation
```

---

## 🎛️ The Mono-Repo Dashboard

The workspace includes a built-in, local **Mono-Repo Dashboard** that acts as your portfolio command center. 

### Features:
1. **Interactive Portfolio**: See a high-fidelity dark-mode overview of all your ideas (`backlog/`) and live apps (`projects/`).
2. **Project Creation**: Create new backlog items or spin up fresh projects directly from the visual dashboard using preconfigured templates.
3. **Spec Viewer**: Render and browse project requirements and system specs directly inside the UI.
4. **Status & Stack Filter**: Filter your projects instantly by category, status, or technology.

### Running the Dashboard:
To start the project hub, run the following command in your terminal:
```bash
node scripts/dashboard.js
```
Then open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 💡 How to Add a New Project

### Option A: Via the Dashboard (Recommended)
1. Launch the dashboard (`node scripts/dashboard.js`).
2. Click on **"+ New Idea"** or **"+ Create Project"**.
3. Fill out the interactive form. The system will automatically generate the directory or markdown spec file for you.

### Option B: Command Line / Manual
1. Copy the spec template from [backlog/template.md](file:///Users/mohit/Desktop/AntiGravityExplore/backlog/template.md) into a new file: `backlog/your-project-name.md`.
2. Flesh out the details (tech stack, features, database models).
3. When ready to code, copy the matching boilerplate from `templates/` into `projects/your-project-name` and begin building.

---

## 🧬 Templates Available

* **Vanilla Web App**: Standard HTML5, CSS Variables with custom themes, and clean modern Javascript module structure. Perfect for ultra-fast, lightweight frontends.
* **Node.js REST API**: Clean Express-style structure using native Node modules or lightweight setups, with standard folder separation (routes, controllers, models).
* **Chrome Extension V3**: Standard Manifest V3 boilerplate with popup, content scripts, and background worker setup.

---

*“The best way to predict the future is to invent it.”* Let's build something remarkable! 🛠️
