#!/bin/bash
# ==============================================================================
# 🎛️ Mono-Repo Exploration Workspace Manager
# ==============================================================================
# A premium, interactive CLI utility to help you manage your exploration 
# projects, verify GitHub connections, and push changes seamlessly.
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

# Ensure excavations directory exists
mkdir -p "explorations"

show_menu() {
  clear
  echo -e "${BLUE}${BOLD}==============================================================================${NC}"
  echo -e "${PURPLE}${BOLD}             🧪  Mono-Repo Exploration Workspace Manager                   ${NC}"
  echo -e "${BLUE}${BOLD}==============================================================================${NC}"
  echo ""
  echo -e "  ${BOLD}1.${NC} 📋 List Active Explorations"
  echo -e "  ${BOLD}2.${NC} 🔬 Create a New Exploration Project"
  echo -e "  ${BOLD}3.${NC} 🔍 Check GitHub Connection & Branch Status"
  echo -e "  ${BOLD}4.${NC} 🚀 Sync & Push Workspace to GitHub"
  echo -e "  ${BOLD}5.${NC} 🚪 Exit"
  echo ""
  echo -e "${BLUE}${BOLD}==============================================================================${NC}"
}

list_explorations() {
  echo -e "\n${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo -e "${CYAN}${BOLD}📋 Active Exploration Projects:${NC}"
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  
  local dirs=(explorations/*/)
  if [ -e "${dirs[0]}" ]; then
    local count=1
    for dir in "${dirs[@]}"; do
      folder_name=$(basename "$dir")
      # Check if directory has README
      local readme_tag=""
      if [ -f "${dir}README.md" ]; then
        readme_tag=" ${GREEN}(README.md present)${NC}"
      fi
      echo -e "  $count. ${BOLD}${CYAN}${folder_name}/${NC}${readme_tag}"
      count=$((count+1))
    done
  else
    echo -e "  ${YELLOW}No active explorations found in explorations/ yet.${NC}"
    echo -e "  Use Option 2 to bootstrap your first project!"
  fi
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo ""
  read -p "Press Enter to return to menu..."
}

create_exploration() {
  echo -e "\n${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo -e "${CYAN}${BOLD}🔬 Create a New Exploration Project:${NC}"
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  
  read -p "Enter a simple folder name for your exploration (e.g. agent-routing): " EXPL_NAME
  
  if [ -z "$EXPL_NAME" ]; then
    echo -e "${RED}❌ Project name cannot be empty. Returning to menu.${NC}"
    sleep 2
    return
  fi
  
  # Format folder name: replace spaces/special chars with hyphens
  clean_name=$(echo "$EXPL_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
  target_dir="explorations/$clean_name"
  
  if [ -d "$target_dir" ]; then
    echo -e "${RED}❌ An exploration directory '$clean_name' already exists.${NC}"
    sleep 2
    return
  fi
  
  echo -e "\n${CYAN}Bootstrapping project directory structure...${NC}"
  mkdir -p "$target_dir"
  
  # Create a clean, premium boilerplate README.md inside the exploration
  cat << EOF > "${target_dir}/README.md"
# 🔬 Exploration: ${EXPL_NAME}

## 🎯 Objectives
Flesh out the main exploration goals, hypotheses, and objectives here!

## 🛠️ Stack & Dependencies
*List technologies, APIs, or libraries being used.*

## 🧪 Experiments & Outcomes
- [ ] Experiment 1 (Details / Outcomes)
- [ ] Experiment 2 (Details / Outcomes)
EOF

  echo -e "${GREEN}✓ Bootstrapped project inside: ${BOLD}${target_dir}/${NC}"
  echo -e "${GREEN}✓ Created: ${target_dir}/README.md${NC}"
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo ""
  read -p "Press Enter to return to menu..."
}

check_github() {
  echo -e "\n${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo -e "${CYAN}${BOLD}🔍 GitHub Connection & Branch Status:${NC}"
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  
  echo -e "${CYAN}🔄 Checking CLI Auth Status...${NC}"
  if gh auth status &>/dev/null; then
    gh auth status
  else
    echo -e "${RED}❌ GitHub CLI is not authenticated or unable to connect.${NC}"
  fi
  
  echo -e "\n${CYAN}🔄 Local Git Config Status...${NC}"
  git status
  
  echo -e "\n${CYAN}🔄 Git Remote Origin Status...${NC}"
  git remote -v
  
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo ""
  read -p "Press Enter to return to menu..."
}

push_workspace() {
  echo -e "\n${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo -e "${CYAN}${BOLD}🚀 Sync & Push Workspace to GitHub:${NC}"
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  
  echo -e "${CYAN}Staging all master workspace configuration changes...${NC}"
  git add .gitignore README.md scripts/ 2>/dev/null || true
  
  echo -e "\n${CYAN}Workspace Git status before commit:${NC}"
  git status -s
  
  echo ""
  read -p "Enter a commit message (or press Enter for default 'chore: sync workspace configs'): " MSG
  if [ -z "$MSG" ]; then
    MSG="chore: sync workspace configs"
  fi
  
  if git commit -m "$MSG"; then
    echo -e "${GREEN}✓ Created commit: '$MSG'${NC}"
  else
    echo -e "${YELLOW}- No changes to commit.${NC}"
  fi
  
  echo -e "\n${CYAN}🔄 Pushing master configurations to GitHub...${NC}"
  if git push origin main; then
    echo -e "${GREEN}✓ Successfully synced parent mono-repo to GitHub!${NC}"
  else
    echo -e "${RED}❌ Push failed. Please check network connection or credentials.${NC}"
  fi
  
  echo -e "${BLUE}${BOLD}------------------------------------------------------------------------------${NC}"
  echo ""
  read -p "Press Enter to return to menu..."
}

# Main event loop
while true; do
  show_menu
  read -p "Select an option [1-5]: " OPTION
  
  case "$OPTION" in
    1) list_explorations ;;
    2) create_exploration ;;
    3) check_github ;;
    4) push_workspace ;;
    5) echo -e "\n${GREEN}Happy coding! Goodbye! 👋${NC}\n"; exit 0 ;;
    *) echo -e "\n${RED}❌ Invalid option. Try again.${NC}"; sleep 1.5 ;;
  esac
done
