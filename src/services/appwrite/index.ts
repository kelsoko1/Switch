// Export all Appwrite services
export * from './appwriteService';
export * from './userService';
export * from './walletService';
export * from './groupService';
export * from './messageService';

// Export default instances
import userService from './userService';
import walletService from './walletService';
import groupService from './groupService';
import { messageService } from './messageService';

export {
  userService,
  walletService,
  groupService,
  messageService
};

// Main export
const appwriteServices = {
  userService,
  walletService,
  groupService,
  messageService
};

export default appwriteServices;
