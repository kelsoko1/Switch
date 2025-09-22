// Export all Appwrite services
export * from './appwriteService';
export * from './userService';
export * from './walletService';
export * from './groupService';
export * from './messageService';
export * from './realtimeService';

// Export default instances
import userService from './userService';
import walletService from './walletService';
import groupService from './groupService';
import { messageService } from './messageService';
import { realtimeService } from './realtimeService';

export {
  userService,
  walletService,
  groupService,
  messageService,
  realtimeService
};

// Main export
const appwriteServices = {
  userService,
  walletService,
  groupService,
  messageService,
  realtimeService
};

export default appwriteServices;
