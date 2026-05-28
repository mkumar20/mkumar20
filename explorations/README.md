# 🧪 Active Platform Workspaces (Git Submodules)

Welcome to the central launchpad of your independent Gen AI platforms. 

Rather than standard directory folders, each workspace under this directory is a **fully independent Git repository** tracked as a **Git Submodule** in this master Meta-Repo. This architecture enables granular versioning, isolated lifecycles, and separate continuous integration/deployment boundaries for your advanced AI systems.

---

## 🔬 Active Platforms & Status
*   **[multi-agent-factory](multi-agent-factory/)**: Production-grade multi-agent orchestration fabric.
*   **[unified-ai-bench](unified-ai-bench/)**: Unified framework to benchmark LLM latency and semantic performance.

---

## 🛠️ Submodule Development Workflow

### 1. Cloning the Meta-Repo
When cloning this Meta-Repo for the first time, you must initialize and pull the nested submodules:
```bash
git clone --recursive https://github.com/mkumar20/mkumar20.git
# Or if already cloned:
git submodule update --init --recursive
```

### 2. Upgraded Workspace Manager
The local CLI Workspace Manager has been upgraded to orchestrate this submodule architecture. Run it from the workspace root:
```bash
bash scripts/workspace_mgr.sh
```

**Key Capabilities:**
*   📋 **List Active Platform Submodules:** Scans `.gitmodules` and outputs active checkout hashes, sync states, and uncommitted local changes.
*   🔬 **Bootstrap a New Independent Platform Repo:** Prompts for platform name and visibility (Private vs Public), calls the GitHub CLI (`gh`) to automatically provision the remote repo, commits standard boilerplates, and registers it as a new submodule using `--force` to prevent cached directory conflicts.
*   🔍 **Check GitHub & Submodule Status:** Runs comprehensive checks on your master branch and all nested submodules.
*   🚀 **Sync & Push All Workspaces:** Interactively scans all active submodules, prompts to commit and push local changes within them, updates the submodule pointer hashes, and commits the updates to the master Meta-Repo.

---

## ⚠️ Important Rules for Submodule Development
1.  **Commit Submodules First:** Always stage and commit changes *inside* your submodule directories (`explorations/<name>/`) and push them to their remote origins *before* pushing the master Meta-Repo. (The Workspace Manager Option 5 automates this flow safely).
2.  **Parent Pointer Sync:** Committing changes inside a submodule changes its checkout hash. The master Meta-Repo tracks this hash. Remember to stage and commit the updated submodule folders in the parent repository.
