#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure script is run with bash
if [ -z "$BASH_VERSION" ]; then
    echo -e "${RED}Please run this script with bash${NC}"
    exit 1
fi

# Check and install dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking system dependencies...${NC}"
    
    # List of required dependencies
    DEPENDENCIES=(
        "curl"
        "wget"
        "git"
        "build-essential"
        "xvfb"
    )

    for dep in "${DEPENDENCIES[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${YELLOW}Installing $dep...${NC}"
            sudo apt-get update
            sudo apt-get install -y "$dep"
        fi
    done
}

# Install Node Version Manager (nvm)
install_nvm() {
    echo -e "${YELLOW}Installing/Updating Node Version Manager (nvm)...${NC}"
    
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    fi

    # Source nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
}

# Install Node.js LTS
install_nodejs() {
    echo -e "${YELLOW}Installing Node.js LTS...${NC}"
    
    nvm install --lts
    nvm use --lts
    nvm alias default node

    # Verify installation
    echo -e "${GREEN}Node.js version:${NC} $(node --version)"
    echo -e "${GREEN}npm version:${NC} $(npm --version)"
}

# Project setup
setup_project() {
    echo -e "${YELLOW}Setting up project dependencies...${NC}"
    
    # Navigate to project root
    cd "$( dirname "${BASH_SOURCE[0]}" )"
    
    # Install root dependencies
    npm install
    
    # Install frontend dependencies
    cd frontend
    npm install
}

# Main execution
main() {
    check_dependencies
    install_nvm
    install_nodejs
    setup_project

    echo -e "${GREEN}✅ Project setup completed successfully!${NC}"
}

# Run main function
main
