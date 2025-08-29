#!/bin/bash

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${YELLOW}[APPWRITE MIGRATION]${NC} $1"
}

# Error handling function
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Prerequisite check
check_prerequisites() {
    log "Checking system prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose."
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 16+ first."
    fi
}

# Install Docker (if not already installed)
install_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Update package list
    sudo apt-get update

    # Install dependencies
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common

    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

    # Set up Docker repository
    sudo add-apt-repository \
       "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
       $(lsb_release -cs) \
       stable"

    # Install Docker and Docker Compose
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-compose

    # Add current user to docker group
    sudo usermod -aG docker $USER
}

# Setup Appwrite local environment
setup_appwrite() {
    log "Setting up Appwrite local environment..."
    
    # Create Appwrite directory
    mkdir -p ~/appwrite-local
    cd ~/appwrite-local

    # Download Appwrite Docker Compose
    curl -L https://appwrite.io/install/compose.yml -o docker-compose.yml

    # Start Appwrite services
    docker-compose up -d

    # Wait for Appwrite to initialize
    log "Waiting for Appwrite to start (60 seconds)..."
    sleep 60
}

# Create Appwrite configuration
create_appwrite_config() {
    log "Creating Appwrite configuration files..."
    
    # Create config directory if not exists
    mkdir -p config

    # Create Appwrite configuration file
    cat > config/appwrite.js << EOL
const { Client, Databases, Query } = require('appwrite');
require('dotenv').config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

module.exports = {
  client,
  databases,
  DATABASE_ID: 'your_database_id',
  COLLECTIONS: {
    USERS: 'users',
    GROUPS: 'groups',
    MEMBERS: 'members',
    TRANSACTIONS: 'transactions',
    PAYMENTS: 'payments',
    OVERDRAFTS: 'overdrafts',
    WHATSAPP_MESSAGES: 'whatsapp_messages'
  },
  Query
};
EOL

    # Create test connection script
    cat > test-appwrite.js << EOL
const { Client, Databases, Query } = require('appwrite');
require('dotenv').config();

async function testAppwriteConnection() {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    console.log('✅ Appwrite Connection Successful');
    console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
    console.log('Project ID:', process.env.APPWRITE_PROJECT_ID);
  } catch (error) {
    console.error('❌ Appwrite Connection Failed:', error);
  }
}

testAppwriteConnection();
EOL
}

# Install Appwrite SDK
install_appwrite_sdk() {
    log "Installing Appwrite SDK..."
    npm install appwrite@latest dotenv
}

# Main migration function
migrate_appwrite() {
    check_prerequisites
    install_docker
    setup_appwrite
    create_appwrite_config
    install_appwrite_sdk

    log "${GREEN}Appwrite local migration completed successfully!${NC}"
    log "Next steps:"
    log "1. Open http://localhost:80 in your browser"
    log "2. Login with default credentials (admin@appwrite.io/password)"
    log "3. Create a new project named 'Kijumbe Local'"
    log "4. Update .env with your Project ID and API Keys"
    log "5. Run 'node test-appwrite.js' to verify connection"
}

# Execute migration
migrate_appwrite
