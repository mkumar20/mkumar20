#!/bin/bash
set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Error: Please provide the project folder name."
    echo "Usage: bash scripts/publish_project.sh <project-folder-name>"
    exit 1
fi

PROJECT_PATH="projects/$PROJECT_NAME"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: Project directory '$PROJECT_PATH' does not exist."
    exit 1
fi

echo "🏁 Initializing and publishing '$PROJECT_NAME' as an independent repository..."

# 1. CD to the project and initialize Git locally
cd "$PROJECT_PATH"
if [ ! -d ".git" ]; then
    git init -b main
    echo "✓ Initialized local Git repository inside $PROJECT_PATH"
else
    echo "✓ Git repository already exists inside $PROJECT_PATH"
fi

# 2. Add files and commit
git add .
git commit -m "Initial commit for $PROJECT_NAME" || echo "No changes to commit"

# 3. Create a private GitHub repository for the project
echo "🚀 Creating private GitHub repository 'mkumar20/$PROJECT_NAME'..."
if /opt/homebrew/bin/gh repo view "mkumar20/$PROJECT_NAME" &>/dev/null; then
    echo "✓ GitHub repository 'mkumar20/$PROJECT_NAME' already exists."
    if ! git remote | grep -q "origin"; then
        git remote add origin "https://github.com/mkumar20/$PROJECT_NAME.git"
    fi
    git push -u origin main
else
    /opt/homebrew/bin/gh repo create "$PROJECT_NAME" --private --source=. --remote=origin --push
    echo "🎉 Successfully created and pushed 'mkumar20/$PROJECT_NAME'"
fi

# Go back to root
cd ../..

# 4. Integrate into Meta-Repo as a Git Submodule
echo "🔗 Integrating project into meta-repo as a submodule..."

# We need to temporarily move the local project directory out to add it as a submodule
TEMP_DIR="/tmp/${PROJECT_NAME}_submodule_temp"
rm -rf "$TEMP_DIR"
mv "$PROJECT_PATH" "$TEMP_DIR"

# Add as Git Submodule pointing to the new GitHub repo
git submodule add "https://github.com/mkumar20/${PROJECT_NAME}.git" "$PROJECT_PATH"

# Copy back any uncommitted changes (just in case)
rsync -av --exclude='.git' "$TEMP_DIR/" "$PROJECT_PATH/"
rm -rf "$TEMP_DIR"

# Commit and push submodule to the meta-repo
git add "$PROJECT_PATH" .gitmodules
git commit -m "chore: add $PROJECT_NAME as a submodule to meta-repo" || echo "Submodule already committed"
git push origin main

echo ""
echo "======================================================"
echo "✅ Project '$PROJECT_NAME' is now a tracked Submodule!"
echo "👉 Meta Repo: https://github.com/mkumar20/AntiGravityExplore"
echo "👉 Project Repo: https://github.com/mkumar20/$PROJECT_NAME"
echo "======================================================"
