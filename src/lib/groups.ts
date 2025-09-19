import { db, COLLECTIONS, auth } from './appwrite';
import { PaymentManager } from './payments';

export interface ChatGroup {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
  messages?: GroupMessage[];
  fund_collections?: FundCollection[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface FundCollection {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  description: string | null;
  target_amount: number;
  deadline: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  contributions?: FundContribution[];
  total_collected?: number;
}

export interface FundContribution {
  id: string;
  collection_id: string;
  user_id: string;
  amount: number;
  transaction_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export class GroupManager {
  async createGroup(name: string, description?: string, avatarUrl?: string): Promise<ChatGroup> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const groupId = `group_${currentUser.$id}_${Date.now()}`;
      const groupData = {
        name,
        description: description || null,
        avatar_url: avatarUrl || null,
        created_by: currentUser.$id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const group = await db.createDocument(
        COLLECTIONS.GROUPS,
        groupId,
        groupData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      // Add creator as admin
      const memberId = `member_${groupId}_${currentUser.$id}`;
      const memberData = {
        group_id: groupId,
        user_id: currentUser.$id,
        role: 'admin',
        joined_at: new Date().toISOString(),
      };

      await db.createDocument(
        COLLECTIONS.GROUP_MEMBERS,
        memberId,
        memberData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      return group as ChatGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroups(): Promise<ChatGroup[]> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        console.warn('Appwrite not configured, returning empty groups');
        return [];
      }

      const result = await db.listDocuments(COLLECTIONS.GROUPS, [
        'orderDesc(updated_at)',
        'limit(50)'
      ]);

      // For each group, fetch members separately
      const groupsWithMembers = await Promise.all(
        result.documents.map(async (group) => {
          try {
            const membersResult = await db.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
              `group_id=${group.$id}`,
              'limit(100)'
            ]);

            // For each member, fetch user data
            const membersWithUsers = await Promise.all(
              membersResult.documents.map(async (member) => {
                try {
                  const userResult = await db.getDocument(COLLECTIONS.USERS, member.user_id);
                  return { ...member, user: { id: userResult.$id, email: userResult.email } };
                } catch (userError) {
                  console.warn('Could not fetch user for member:', userError);
                  return { ...member, user: null };
                }
              })
            );

            return { ...group, members: membersWithUsers };
          } catch (memberError) {
            console.warn('Could not fetch members for group:', memberError);
            return { ...group, members: [] };
          }
        })
      );

      return groupsWithMembers as ChatGroup[];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  async getGroupDetails(groupId: string): Promise<ChatGroup> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const group = await db.getDocument(COLLECTIONS.GROUPS, groupId);

      // Fetch members
      const membersResult = await db.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        `group_id=${groupId}`,
        'limit(100)'
      ]);

      const membersWithUsers = await Promise.all(
        membersResult.documents.map(async (member) => {
          try {
            const userResult = await db.getDocument(COLLECTIONS.USERS, member.user_id);
            return { ...member, user: { id: userResult.$id, email: userResult.email } };
          } catch (userError) {
            console.warn('Could not fetch user for member:', userError);
            return { ...member, user: null };
          }
        })
      );

      // Fetch messages
      const messagesResult = await db.listDocuments(COLLECTIONS.GROUP_MESSAGES, [
        `group_id=${groupId}`,
        'orderDesc(created_at)',
        'limit(100)'
      ]);

      const messagesWithUsers = await Promise.all(
        messagesResult.documents.map(async (message) => {
          try {
            const userResult = await db.getDocument(COLLECTIONS.USERS, message.user_id);
            return { ...message, user: { id: userResult.$id, email: userResult.email } };
          } catch (userError) {
            console.warn('Could not fetch user for message:', userError);
            return { ...message, user: null };
          }
        })
      );

      return {
        ...group,
        members: membersWithUsers,
        messages: messagesWithUsers,
        fund_collections: [] // TODO: Implement fund collections
      } as ChatGroup;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    }
  }

  async sendMessage(groupId: string, content: string): Promise<GroupMessage> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const messageId = `msg_${groupId}_${currentUser.$id}_${Date.now()}`;
      const messageData = {
        group_id: groupId,
        user_id: currentUser.$id,
        content,
        created_at: new Date().toISOString(),
      };

      const result = await db.createDocument(
        COLLECTIONS.GROUP_MESSAGES,
        messageId,
        messageData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      return {
        ...result,
        user: { id: currentUser.$id, email: currentUser.email }
      } as GroupMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async createFundCollection(
    groupId: string,
    title: string,
    targetAmount: number,
    description?: string,
    deadline?: Date
  ): Promise<FundCollection> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const collectionId = `fund_${groupId}_${currentUser.$id}_${Date.now()}`;
      const collectionData = {
        group_id: groupId,
        created_by: currentUser.$id,
        title,
        description: description || null,
        target_amount: targetAmount,
        deadline: deadline?.toISOString() || null,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const result = await db.createDocument(
        COLLECTIONS.FUND_COLLECTIONS,
        collectionId,
        collectionData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      return result as FundCollection;
    } catch (error) {
      console.error('Error creating fund collection:', error);
      throw error;
    }
  }

  async contribute(collectionId: string, amount: number): Promise<FundContribution> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'demo-project';
      if (APPWRITE_PROJECT_ID === 'demo-project') {
        throw new Error('Appwrite not configured');
      }

      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Process payment
      const paymentManager = new PaymentManager(currentUser.$id);
      const transaction = await paymentManager.sendGift(collectionId, currentUser.$id, amount);

      // Record contribution
      const contributionId = `contrib_${collectionId}_${currentUser.$id}_${Date.now()}`;
      const contributionData = {
        collection_id: collectionId,
        user_id: currentUser.$id,
        amount,
        transaction_id: transaction.id,
        created_at: new Date().toISOString(),
      };

      const result = await db.createDocument(
        COLLECTIONS.FUND_CONTRIBUTIONS,
        contributionId,
        contributionData,
        [`read("user:${currentUser.$id}")`, `write("user:${currentUser.$id}")`]
      );

      return {
        ...result,
        user: { id: currentUser.$id, email: currentUser.email }
      } as FundContribution;
    } catch (error) {
      console.error('Error contributing to fund:', error);
      throw error;
    }
  }
}