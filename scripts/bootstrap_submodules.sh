#!/bin/bash
# ==============================================================================
# 🚀 Platform Migration Submodule Bootstrapper
# ==============================================================================
# Migrates the initial placeholder explorations to fully independent 
# GitHub repositories and registers them as Git Submodules.
# ==============================================================================

# ANSI Color Codes for beautiful terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}==============================================================================${NC}"
echo -e "${PURPLE}${BOLD}             🚀  Independent Platform Submodule Migrator                       ${NC}"
echo -e "${BLUE}${BOLD}==============================================================================${NC}"
echo ""

# Verify we are in the root directory
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ Error: Must run from workspace root containing .git folder.${NC}"
  exit 1
fi

# Retrieve GitHub namespace dynamically from remote origin
remote_url=$(git remote get-url origin 2>/dev/null)
gh_user="mkumar20" # default fallback
if [[ "$remote_url" =~ github.com[:/]([^/]+) ]]; then
  gh_user="${BASH_REMATCH[1]}"
  gh_user="${gh_user%.git}"
fi

# Check if GitHub CLI is logged in
echo -e "${CYAN}🔄 Verifying GitHub CLI authentication...${NC}"
if ! gh auth status &>/dev/null; then
  echo -e "${RED}❌ Error: GitHub CLI (gh) is not authenticated.${NC}"
  echo -e "Please run ${YELLOW}gh auth login${NC} first to allow remote repository creation."
  exit 1
fi
echo -e "${GREEN}✓ GitHub CLI is authenticated! Namespace: ${gh_user}${NC}"

PLATFORMS=("multi-agent-factory" "unified-ai-bench")

for plat in "${PLATFORMS[@]}"; do
  echo -e "\n${BLUE}------------------------------------------------------------------------------${NC}"
  echo -e "${CYAN}${BOLD}📦 Migrating Platform: ${plat}${NC}"
  echo -e "${BLUE}------------------------------------------------------------------------------${NC}"
  
  target_dir="explorations/${plat}"
  
  if [ -d "$target_dir" ]; then
    echo -e "${YELLOW}⚠️  Directory '$target_dir' already exists. Skipping.${NC}"
    continue
  fi
  
  # 1. Provision repository on GitHub
  echo -e "${CYAN}🔄 Creating private GitHub repository: https://github.com/${gh_user}/${plat}...${NC}"
  if ! gh repo create "${gh_user}/${plat}" --private --confirm &>/dev/null; then
    # Check if repo already exists, if so we link to it
    echo -e "${YELLOW}⚠️  Could not create remote repository (it may already exist). Attempting to link...${NC}"
  else
    echo -e "${GREEN}✓ Remote repository created on GitHub!${NC}"
  fi
  
  # 2. Setup initial boilerplate in temporary folder
  echo -e "${CYAN}🔄 Initializing boilerplate files...${NC}"
  tmp_dir="explorations/.tmp-${plat}"
  mkdir -p "$tmp_dir"
  
  # Write custom boilerplate based on platform name
  if [ "$plat" = "multi-agent-factory" ]; then
    cat << EOF > "${tmp_dir}/README.md"
# 🔬 Platform: Multi-Agent Factory

## 🎯 Objectives
Build a production-grade multi-agent orchestration fabric.
- Implement agent lifecycle management.
- Provide declarative agent definition schemas.
- Enable high-throughput pub/sub event channels between agents.

## 🛠️ Stack & Dependencies
* Languages: TypeScript, Python
* Runtime: Node.js (v20+), FastAPI
* Orchestration: Pnpm workspaces

## 🧪 Experiments & Outcomes
- [ ] Initial multi-agent engine build (v0.1.0)
EOF
  else
    cat << EOF > "${tmp_dir}/README.md"
# 🔬 Platform: Unified AI Benchmark Suite

## 🎯 Objectives
Provide a comprehensive framework to benchmark LLM latency, semantic performance, and token throughput.
- Benchmark complex agent flows and RAG pipelines.
- Standardize performance metrics across multiple models.

## 🛠️ Stack & Dependencies
* Languages: Python, Go
* Frameworks: Streamlit, Poetry

## 🧪 Experiments & Outcomes
- [ ] Benchmarking harness setup (v0.1.0)
EOF
  fi
  
  cat << EOF > "${tmp_dir}/.gitignore"
# Local environments and configurations
.env
.env.local
.env.*.local
dist/
node_modules/
bin/
obj/
*.log
.DS_Store
EOF
  
  # Push initial commits to remote
  (
    cd "$tmp_dir" || exit 1
    git init -b main &>/dev/null
    git config user.name "$(git config --global user.name)"
    git config user.email "$(git config --global user.email)"
    git add .
    git commit -m "initial commit: bootstrap ${plat}" &>/dev/null
    git remote add origin "https://github.com/${gh_user}/${plat}.git"
    # Force push in case repo existed and was empty
    git push -u origin main -f &>/dev/null
  )
  
  # Delete temporary directory
  rm -rf "$tmp_dir"
  
  # 3. Add as Git Submodule
  echo -e "${CYAN}🔄 Registering as Git Submodule...${NC}"
  if git submodule add --force "https://github.com/${gh_user}/${plat}.git" "$target_dir"; then
    echo -e "${GREEN}✓ Successfully registered submodule for ${plat}!${NC}"
  else
    echo -e "${RED}❌ Failed to register submodule for ${plat}.${NC}"
  fi
done

echo -e "\n${BLUE}${BOLD}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}🎉 Platform Migration and Submodule Setup Complete!${NC}"
echo -e "${BLUE}${BOLD}==============================================================================${NC}"
echo -e "\nYou can now run your workspace manager to see the updated status:"
echo -e "  ${BOLD}bash scripts/workspace_mgr.sh${NC}\n"
