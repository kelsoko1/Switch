import { database as db, COLLECTIONS, auth } from './appwrite';
import { PaymentManager } from './payments';

type Document = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: any;
};

export interface ChatGroup extends Omit<Document, '$id' | '$createdAt' | '$updatedAt'> {
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

export interface GroupMember extends Omit<Document, '$id' | '$createdAt' | '$updatedAt'> {
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

export interface GroupMessage extends Omit<Document, '$id' | '$createdAt' | '$updatedAt'> {
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

export interface FundCollection extends Omit<Document, '$id' | '$createdAt' | '$updatedAt'> {
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

export interface FundContribution extends Omit<Document, '$id' | '$createdAt' | '$updatedAt'> {
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
  async addGroupMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<GroupMember> {
    try {
      const memberId = `member_${groupId}_${userId}`;
      const memberData = {
        group_id: groupId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      };

      const memberDoc = await db.createDocument(
        COLLECTIONS.GROUP_MEMBERS,
        {
          ...memberData,
          $permissions: [
            `read(\"user:${userId}\")`,
            `write(\"user:${userId}\")`,
            `read(\"group:${groupId}\")`,
            `write(\"group:${groupId}\")`
          ]
        }
      ) as unknown as Document;
      
      const member: GroupMember = {
        id: memberDoc.$id,
        group_id: groupId,
        user_id: userId,
        role,
        joined_at: memberData.joined_at,
        $collectionId: memberDoc.$collectionId,
        $databaseId: memberDoc.$databaseId,
        $createdAt: memberDoc.$createdAt,
        $updatedAt: memberDoc.$updatedAt,
        $permissions: memberDoc.$permissions
      };

      return {
        id: member.$id,
        group_id: groupId,
        user_id: userId,
        role,
        joined_at: memberData.joined_at,
      };
    } catch (error) {
      console.error('Error adding group member:', error);
      throw new Error('Failed to add member to group');
    }
  }

  async createGroup(name: string, description?: string, avatarUrl?: string): Promise<ChatGroup> {
    try {
      // Check if Appwrite is properly configured
      const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
      if (!APPWRITE_PROJECT_ID) {
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

      // Create the group
      const groupDoc = await db.createDocument(
        COLLECTIONS.GROUPS,
        {
          ...groupData,
          $permissions: [
            `read(\"user:${currentUser.$id}\")`,
            `write(\"user:${currentUser.$id}\")`,
            `read(\"group:${groupId}\")`,
            `write(\"group:${groupId}\")`
          ]
        }
      ) as unknown as Document;
      
      const group: ChatGroup = {
        id: groupDoc.$id,
        name: groupData.name,
        description: groupData.description,
        avatar_url: groupData.avatar_url,
        created_by: currentUser.$id,
        created_at: groupData.created_at,
        updated_at: groupData.updated_at,
        $collectionId: groupDoc.$collectionId,
        $databaseId: groupDoc.$databaseId,
        $createdAt: groupDoc.$createdAt,
        $updatedAt: groupDoc.$updatedAt,
        $permissions: groupDoc.$permissions
      };

      // Add creator as admin
      await this.addGroupMember(groupId, currentUser.$id, 'admin');

      return {
        id: group.$id,
        name: group.name,
        description: group.description,
        avatar_url: group.avatar_url,
        created_by: currentUser.$id,
        created_at: group.created_at,
        updated_at: group.updated_at,
      };
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

      // Fetch messages (using GROUP_MEMBERS as a temporary collection for messages)
      const messagesResult = await db.listDocuments(
        COLLECTIONS.GROUP_MEMBERS,
        [
          `group_id=${groupId}`,
          'order($createdAt.desc)',
          'limit(50)'
        ]
      ) as { documents: Document[] };

      const messagesWithUsers = await Promise.all(
        (messagesResult.documents as any[]).map(async (message) => {
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

  async getGroupMessages(groupId: string, limit: number = 50, offset: number = 0): Promise<GroupMessage[]> {
    try {
      // Using GROUP_MEMBERS as a temporary collection for messages
      const messagesResult = await db.listDocuments(
        COLLECTIONS.GROUP_MEMBERS,
        [
          `group_id=${groupId}`,
          'order($createdAt.desc)',
          `limit(${limit})`,
          `offset(${offset})`
        ]
      ) as unknown as { documents: Array<Document & { user_id: string; group_id: string; content?: string }> };
      
      const messagesWithUsers = await Promise.all(
        messagesResult.documents.map(async (doc) => {
          try {
            const userDoc = await db.getDocument(COLLECTIONS.USERS, doc.user_id);
            return {
              id: doc.$id,
              group_id: doc.group_id,
              user_id: doc.user_id,
              content: doc.content || '',
              created_at: doc.$createdAt,
              $collectionId: doc.$collectionId,
              $databaseId: doc.$databaseId,
              $createdAt: doc.$createdAt,
              $updatedAt: doc.$updatedAt,
              $permissions: doc.$permissions,
              user: { id: userDoc.$id, email: (userDoc as any).email as string }
            } as GroupMessage;
          } catch (error) {
            console.error('Error fetching user for message:', error);
            return null;
          }
        })
      );

      // Filter out any null values from the map
      return messagesWithUsers.filter(Boolean) as GroupMessage[];
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  }

  async getGroupWithMembers(groupId: string): Promise<ChatGroup> {
    try {
      const groupDoc = await db.getDocument(COLLECTIONS.GROUPS, groupId);
      
      // Fetch members
      const membersResult = await db.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        `group_id=${groupId}`
      ]);

      // Fetch messages (using GROUP_MEMBERS as a temporary collection)
      const messagesResult = await db.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        `group_id=${groupId}`,
        'order($createdAt.desc)',
        'limit(50)'
      ]) as { documents: Document[] };

      const messagesWithUsers = await Promise.all(
        messagesResult.documents.map(async (messageDoc) => {
          try {
            const userDoc = await db.getDocument(COLLECTIONS.USERS, messageDoc.user_id as string);
            return {
              id: messageDoc.$id,
              group_id: messageDoc.group_id as string,
              user_id: messageDoc.user_id as string,
              content: messageDoc.content as string || '',
              created_at: messageDoc.$createdAt,
              user: { id: userDoc.$id, email: userDoc.email as string }
            };
          } catch (error) {
            console.error('Error fetching user for message:', error);
            return null;
          }
        })
      );

      const membersWithUsers = await Promise.all(
        membersResult.documents.map(async (memberDoc) => {
          try {
            const userDoc = await db.getDocument(COLLECTIONS.USERS, memberDoc.user_id as string);
            return {
              id: memberDoc.$id,
              group_id: memberDoc.group_id as string,
              user_id: memberDoc.user_id as string,
              role: memberDoc.role as 'admin' | 'member',
              joined_at: memberDoc.joined_at as string,
              user: { id: userDoc.$id, email: userDoc.email as string }
            };
          } catch (error) {
            console.error('Error fetching user for member:', error);
            return null;
          }
        })
      );

      // Filter out any null values from the maps
      const validMessages = messagesWithUsers.filter(Boolean) as GroupMessage[];
      const validMembers = membersWithUsers.filter(Boolean) as GroupMember[];

      return {
        id: groupDoc.$id,
        name: groupDoc.name as string,
        description: groupDoc.description as string | null,
        avatar_url: groupDoc.avatar_url as string | null,
        created_by: groupDoc.created_by as string,
        created_at: groupDoc.$createdAt,
        updated_at: groupDoc.$updatedAt,
        members: validMembers,
        messages: validMessages,
        $collectionId: groupDoc.$collectionId,
        $databaseId: groupDoc.$databaseId,
        $createdAt: groupDoc.$createdAt,
        $updatedAt: groupDoc.$updatedAt,
        $permissions: groupDoc.$permissions
      };
    } catch (error) {
      console.error('Error fetching group with members:', error);
      throw error;
    }
  }

  async sendGroupMessage(groupId: string, content: string): Promise<GroupMessage> {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const messageDoc = await db.createDocument(
        COLLECTIONS.GROUP_MEMBERS, // Using GROUP_MEMBERS as a temporary collection for messages
        {
          group_id: groupId,
          user_id: currentUser.$id,
          content,
          created_at: new Date().toISOString(),
          $permissions: [
            `read(\"user:${currentUser.$id}\")`,
            `write(\"user:${currentUser.$id}\")`,
            `read(\"group:${groupId}\")`,
            `write(\"group:${groupId}\")`
          ]
        }
      ) as unknown as Document & { $id: string; $collectionId: string; $databaseId: string; $createdAt: string; $updatedAt: string; $permissions: string[] };

      // Fetch the sender's user data
      const userDoc = await db.getDocument(COLLECTIONS.USERS, currentUser.$id);
      
      return {
        id: messageDoc.$id,
        group_id: groupId,
        user_id: currentUser.$id,
        content,
        created_at: messageDoc.$createdAt,
        $collectionId: messageDoc.$collectionId,
        $databaseId: messageDoc.$databaseId,
        $createdAt: messageDoc.$createdAt,
        $updatedAt: messageDoc.$updatedAt,
        $permissions: messageDoc.$permissions,
        user: { id: userDoc.$id, email: (userDoc as any).email as string }
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
    deadline?: string
  ): Promise<FundCollection> {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Using GROUPS as a temporary collection for fund collections
      const collectionDoc = await db.createDocument(
        COLLECTIONS.GROUPS,
        {
          group_id: groupId,
          created_by: currentUser.$id,
          title,
          description: description || null,
          target_amount: targetAmount,
          deadline: deadline || null,
          status: 'active',
          created_at: new Date().toISOString(),
          $permissions: [
            `read(\"user:${currentUser.$id}\")`,
            `write(\"user:${currentUser.$id}\")`,
            `read(\"group:${groupId}\")`,
            `write(\"group:${groupId}\")`
          ]
        }
      ) as unknown as Document;

      const collection: FundCollection = {
        id: collectionDoc.$id,
        group_id: groupId,
        created_by: currentUser.$id,
        title,
        description: description || null,
        target_amount: targetAmount,
        deadline: deadline || null,
        status: 'active',
        created_at: collectionDoc.$createdAt,
        $collectionId: collectionDoc.$collectionId,
        $databaseId: collectionDoc.$databaseId,
        $createdAt: collectionDoc.$createdAt,
        $updatedAt: collectionDoc.$updatedAt,
        $permissions: collectionDoc.$permissions
      };

      return collection;
    } catch (error) {
      console.error('Error creating fund collection:', error);
      throw new Error('Failed to create fund collection');
    }
  }

  async addFundContribution(
    collectionId: string,
    amount: number,
    transactionId: string
  ): Promise<FundContribution> {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const contributionDoc = await db.createDocument(
        COLLECTIONS.TRANSACTIONS, // Using TRANSACTIONS as a temporary collection for contributions
        {
          collection_id: collectionId,
          user_id: currentUser.$id,
          amount,
          transaction_id: transactionId,
          created_at: new Date().toISOString(),
          $permissions: [
            `read(\"user:${currentUser.$id}\")`,
            `write(\"user:${currentUser.$id}\")`,
            `read(\"collection:${collectionId}\")`,
            `write(\"collection:${collectionId}\")`
          ]
        }
      ) as unknown as Document & { $id: string; $collectionId: string; $databaseId: string; $createdAt: string; $updatedAt: string; $permissions: string[] };

      // Fetch the user document to get email
      const userDoc = await db.getDocument(COLLECTIONS.USERS, currentUser.$id);

      return {
        id: contributionDoc.$id,
        collection_id: collectionId,
        user_id: currentUser.$id,
        amount,
        transaction_id: transactionId,
        created_at: contributionDoc.$createdAt,
        $collectionId: contributionDoc.$collectionId,
        $databaseId: contributionDoc.$databaseId,
        $createdAt: contributionDoc.$createdAt,
        $updatedAt: contributionDoc.$updatedAt,
        $permissions: contributionDoc.$permissions,
        user: { id: currentUser.$id, email: (userDoc as any).email as string }
      } as FundContribution;
    } catch (error) {
      console.error('Error adding fund contribution:', error);
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