# Appwrite Integration Demo

This demo showcases the direct integration of Appwrite with the Switch app, enabling real-time data operations and updates.

## Running the Demo

1. **Set up Appwrite**
   
   Follow the instructions in `APPWRITE_SETUP.md` to set up your Appwrite project and configure the environment variables.

2. **Install dependencies**
   
   ```bash
   npm install
   ```

3. **Initialize Appwrite collections**
   
   ```bash
   npm run appwrite:init
   ```

4. **Start the development server**
   
   ```bash
   npm run dev
   ```

5. **Access the demo**
   
   Navigate to `/demo/appwrite` in the app or click on the "Appwrite Demo" link in the navigation bar.

## Demo Features

### Real-time Wallet Updates

The demo showcases real-time wallet balance updates. When you make a deposit or withdrawal, the balance updates instantly across all connected clients.

### Real-time Transaction History

Transaction history updates in real-time as new transactions are created, without requiring a page refresh.

### Direct Data Operations

All data operations go directly to Appwrite:

1. **Create** - New transactions are created directly in Appwrite collections
2. **Read** - Wallet and transaction data is fetched directly from Appwrite
3. **Update** - Changes to wallet balance are immediately persisted to Appwrite

## Testing Real-time Updates

To test the real-time functionality:

1. Open the demo page in two different browser windows or devices
2. Make a deposit or withdrawal in one window
3. Observe how the balance and transaction history update instantly in both windows

## Implementation Details

The demo uses the following components:

- **AppwriteService** - Base service for Appwrite operations
- **WalletService** - Service for wallet and transaction operations
- **RealtimeService** - Service for real-time subscriptions
- **useWalletRealtime** - Hook for real-time wallet updates
- **useTransactionsRealtime** - Hook for real-time transaction updates

## Code Structure

```
src/
├── components/
│   └── demo/
│       └── AppwriteDemo.tsx      # Demo component
├── hooks/
│   └── useRealtime.ts            # Real-time hooks
├── pages/
│   └── demo/
│       └── AppwriteDemoPage.tsx  # Demo page
└── services/
    └── appwrite/
        ├── appwriteService.ts    # Base Appwrite service
        ├── realtimeService.ts    # Real-time subscription service
        └── walletService.ts      # Wallet operations service
```

## Next Steps

After exploring the demo, you can:

1. Implement real-time updates in other parts of the app
2. Add more complex data operations
3. Enhance the offline support
4. Implement more sophisticated real-time features like presence indicators
