const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Kijumbe with ngrok tunnel...\n');

// Function to get ngrok URL
async function getNgrokUrl() {
  return new Promise((resolve) => {
    const checkUrl = () => {
      const http = require('http');
      const req = http.get('http://localhost:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const tunnels = JSON.parse(data);
            if (tunnels.tunnels && tunnels.tunnels.length > 0) {
              const publicUrl = tunnels.tunnels[0].public_url;
              resolve(publicUrl);
            } else {
              setTimeout(checkUrl, 1000);
            }
          } catch (e) {
            setTimeout(checkUrl, 1000);
          }
        });
      });
      req.on('error', () => setTimeout(checkUrl, 1000));
    };
    checkUrl();
  });
}

// Function to update .env file with webhook URL
function updateEnvFile(webhookUrl) {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  let envContent = '';
  
  // Read existing .env or create from env.example
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }
  
  // Update webhook URL
  const webhookRegex = /GREENAPI_WEBHOOK_URL=.*/;
  const newWebhookLine = `GREENAPI_WEBHOOK_URL=${webhookUrl}/backend/whatsapp/webhook`;
  
  if (webhookRegex.test(envContent)) {
    envContent = envContent.replace(webhookRegex, newWebhookLine);
  } else {
    envContent += `\n${newWebhookLine}`;
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated .env with webhook URL: ${webhookUrl}/backend/whatsapp/webhook`);
}

// Start ngrok
console.log('🌐 Starting ngrok tunnel...');
const ngrok = spawn('ngrok', ['http', '3000', '--log=stdout'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('started tunnel')) {
    console.log('✅ ngrok tunnel started');
  }
});

ngrok.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('started tunnel')) {
    console.log('✅ ngrok tunnel started');
  }
});

// Wait a moment for ngrok to start, then get URL and start server
setTimeout(async () => {
  try {
    const ngrokUrl = await getNgrokUrl();
    console.log(`\n🔗 Your ngrok URL: ${ngrokUrl}`);
    console.log(`📱 Webhook URL for GreenAPI: ${ngrokUrl}/backend/whatsapp/webhook`);
    console.log(`\n📋 Copy this webhook URL to your GreenAPI console:`);
    console.log(`   ${ngrokUrl}/backend/whatsapp/webhook\n`);
    
    // Update .env file
    updateEnvFile(ngrokUrl);
    
    // Start the main server
    console.log('🚀 Starting Kijumbe server...');
    const server = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    server.on('close', (code) => {
      console.log(`\n🛑 Server stopped with code ${code}`);
      ngrok.kill();
      process.exit(code);
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      server.kill();
      ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error getting ngrok URL:', error);
    ngrok.kill();
    process.exit(1);
  }
}, 3000);
