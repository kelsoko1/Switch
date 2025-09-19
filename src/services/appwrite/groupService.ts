import { AppwriteService } from './appwriteService';
import { COLLECTIONS } from '@/lib/constants';
import { ID, Query } from 'appwrite';
import { walletService } from './walletService';

export interface KijumbeGroup {
  $id: string;
  name: string;
  kiongozi_id: string;
  max_members: number;
  rotation_duration: number;
  contribution_amount: number;
  status: 'active' | 'inactive' | 'completed';
  current_rotation: number;
  created_at: string;
  description?: string;
  members?: GroupMember[];
  contributions?: GroupContribution[];
  payments?: GroupPayment[];
}

export interface GroupMember {
  $id: string;
  group_id: string;
  user_id: string;
  role: 'kiongozi' | 'member';
  rotation_position: number;
  joined_at: string;
  user?: {
    $id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface GroupContribution {
  $id: string;
  group_id: string;
  user_id: string;
  amount: number;
  rotation: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export interface GroupPayment {
  $id: string;
  group_id: string;
  recipient_id: string;
  amount: number;
  rotation: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export class GroupService extends AppwriteService {
  constructor() {
    super();
  }

  // Create a new Kijumbe group
  async createGroup(userId: string, groupData: Partial<KijumbeGroup>): Promise<KijumbeGroup | null> {
    try {
      const groupId = this.generateId('group_');
      const group = await this.createDocument(
        COLLECTIONS.GROUPS,
        groupId,
        {
          name: groupData.name,
          kiongozi_id: userId,
          max_members: groupData.max_members || 5,
          rotation_duration: groupData.rotation_duration || 30, // days
          contribution_amount: groupData.contribution_amount || 10000,
          status: 'active',
          current_rotation: 1,
          created_at: new Date().toISOString(),
          description: groupData.description || '',
        },
        [`read("user:${userId}")`, `write("user:${userId}")`]
      );

      // Add creator as kiongozi (leader)
      const memberId = this.generateId('member_');
      await this.createDocument(
        COLLECTIONS.GROUP_MEMBERS,
        memberId,
        {
          group_id: groupId,
          user_id: userId,
          role: 'kiongozi',
          rotation_position: 1, // Leader is first to receive funds
          joined_at: new Date().toISOString(),
        },
        [`read("user:${userId}")`, `write("user:${userId}")`]
      );

      return group as unknown as KijumbeGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  // Get groups where user is a member
  async getUserGroups(userId: string): Promise<KijumbeGroup[]> {
    try {
      // First get all group memberships for this user
      const memberships = await this.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        Query.equal('user_id', userId)
      ]);

      if (memberships.documents.length === 0) {
        return [];
      }

      // Extract group IDs
      const groupIds = memberships.documents.map(membership => membership.group_id);

      // Get all these groups
      const groups: KijumbeGroup[] = [];
      for (const groupId of groupIds) {
        try {
          const group = await this.getDocument(COLLECTIONS.GROUPS, groupId);
          groups.push(group as unknown as KijumbeGroup);
        } catch (error) {
          console.warn(`Could not fetch group ${groupId}:`, error);
        }
      }

      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  // Get detailed information about a specific group
  async getGroupDetails(groupId: string): Promise<KijumbeGroup | null> {
    try {
      const group = await this.getDocument(COLLECTIONS.GROUPS, groupId) as unknown as KijumbeGroup;

      // Get group members
      const membersResult = await this.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        Query.equal('group_id', groupId)
      ]);

      // For each member, get user details
      const members: GroupMember[] = [];
      for (const member of membersResult.documents) {
        try {
          const user = await this.getDocument(COLLECTIONS.USERS, member.user_id);
          members.push({
            ...member,
            user: {
              $id: user.$id,
              name: user.name,
              email: user.email,
              phone: user.phone
            }
          } as unknown as GroupMember);
        } catch (error) {
          console.warn(`Could not fetch user ${member.user_id}:`, error);
          members.push(member as unknown as GroupMember);
        }
      }

      // Get contributions for this group
      const contributionsResult = await this.listDocuments(COLLECTIONS.CONTRIBUTIONS, [
        Query.equal('group_id', groupId)
      ]);

      // Get payments for this group
      const paymentsResult = await this.listDocuments(COLLECTIONS.GROUP_PAYMENTS, [
        Query.equal('group_id', groupId)
      ]);

      return {
        ...group,
        members,
        contributions: contributionsResult.documents as unknown as GroupContribution[],
        payments: paymentsResult.documents as unknown as GroupPayment[]
      };
    } catch (error) {
      console.error('Error getting group details:', error);
      return null;
    }
  }

  // Add member to group
  async addMember(groupId: string, userId: string, position: number): Promise<boolean> {
    try {
      const group = await this.getDocument(COLLECTIONS.GROUPS, groupId) as unknown as KijumbeGroup;
      
      // Check if group is full
      const membersResult = await this.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        Query.equal('group_id', groupId)
      ]);
      
      if (membersResult.total >= group.max_members) {
        throw new Error('Group is already full');
      }

      // Check if user is already a member
      const existingMember = membersResult.documents.find(member => member.user_id === userId);
      if (existingMember) {
        throw new Error('User is already a member of this group');
      }

      // Add member
      const memberId = this.generateId('member_');
      await this.createDocument(
        COLLECTIONS.GROUP_MEMBERS,
        memberId,
        {
          group_id: groupId,
          user_id: userId,
          role: 'member',
          rotation_position: position,
          joined_at: new Date().toISOString(),
        },
        [`read("user:${userId}")`, `write("user:${userId}")`]
      );

      return true;
    } catch (error) {
      console.error('Error adding member to group:', error);
      return false;
    }
  }

  // Make contribution to group
  async makeContribution(groupId: string, userId: string, amount: number): Promise<boolean> {
    try {
      const group = await this.getDocument(COLLECTIONS.GROUPS, groupId) as unknown as KijumbeGroup;
      
      // Check if user is a member
      const membersResult = await this.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        Query.equal('group_id', groupId),
        Query.equal('user_id', userId)
      ]);
      
      if (membersResult.total === 0) {
        throw new Error('User is not a member of this group');
      }

      // Create wallet transaction
      const transaction = await walletService.createTransaction(userId, {
        amount,
        type: 'kijumbe_contribution',
        status: 'completed',
        description: `Contribution to ${group.name}`,
        service: 'kijumbe',
        reference_id: groupId
      });

      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      // Create contribution record
      const contributionId = this.generateId('contrib_');
      await this.createDocument(
        COLLECTIONS.CONTRIBUTIONS,
        contributionId,
        {
          group_id: groupId,
          user_id: userId,
          amount,
          rotation: group.current_rotation,
          status: 'completed',
          transaction_id: transaction.$id,
          created_at: new Date().toISOString(),
        },
        [`read("user:${userId}")`, `write("user:${userId}")`]
      );

      return true;
    } catch (error) {
      console.error('Error making contribution:', error);
      return false;
    }
  }

  // Process group payment to current rotation recipient
  async processGroupPayment(groupId: string, adminId: string): Promise<boolean> {
    try {
      const group = await this.getDocument(COLLECTIONS.GROUPS, groupId) as unknown as KijumbeGroup;
      
      // Check if caller is the group admin
      if (group.kiongozi_id !== adminId) {
        throw new Error('Only the group leader can process payments');
      }

      // Find the member for the current rotation
      const membersResult = await this.listDocuments(COLLECTIONS.GROUP_MEMBERS, [
        Query.equal('group_id', groupId),
        Query.equal('rotation_position', group.current_rotation)
      ]);
      
      if (membersResult.total === 0) {
        throw new Error('No member found for current rotation');
      }

      const recipient = membersResult.documents[0];

      // Calculate total contributions for this rotation
      const contributionsResult = await this.listDocuments(COLLECTIONS.CONTRIBUTIONS, [
        Query.equal('group_id', groupId),
        Query.equal('rotation', group.current_rotation),
        Query.equal('status', 'completed')
      ]);

      const totalAmount = contributionsResult.documents.reduce(
        (sum, contrib) => sum + contrib.amount, 0
      );

      // Create wallet transaction for recipient
      const transaction = await walletService.createTransaction(recipient.user_id, {
        amount: totalAmount,
        type: 'kijumbe_payout',
        status: 'completed',
        description: `Payout from ${group.name} (Rotation ${group.current_rotation})`,
        service: 'kijumbe',
        reference_id: groupId
      });

      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      // Create payment record
      const paymentId = this.generateId('payment_');
      await this.createDocument(
        COLLECTIONS.GROUP_PAYMENTS,
        paymentId,
        {
          group_id: groupId,
          recipient_id: recipient.user_id,
          amount: totalAmount,
          rotation: group.current_rotation,
          status: 'completed',
          transaction_id: transaction.$id,
          created_at: new Date().toISOString(),
        },
        [`read("user:${adminId}")`, `write("user:${adminId}")`]
      );

      // Update group to next rotation
      await this.updateDocument(COLLECTIONS.GROUPS, groupId, {
        current_rotation: group.current_rotation + 1,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error processing group payment:', error);
      return false;
    }
  }

  // Get user's contribution status for a specific group
  async getUserContributionStatus(groupId: string, userId: string): Promise<{
    totalContributed: number;
    currentRotationContributed: boolean;
    lastContribution?: string;
  }> {
    try {
      const group = await this.getDocument(COLLECTIONS.GROUPS, groupId) as unknown as KijumbeGroup;
      
      // Get all user's contributions for this group
      const contributionsResult = await this.listDocuments(COLLECTIONS.CONTRIBUTIONS, [
        Query.equal('group_id', groupId),
        Query.equal('user_id', userId),
        Query.equal('status', 'completed')
      ]);

      const totalContributed = contributionsResult.documents.reduce(
        (sum, contrib) => sum + contrib.amount, 0
      );

      // Check if user has contributed for current rotation
      const currentRotationContrib = contributionsResult.documents.find(
        contrib => contrib.rotation === group.current_rotation
      );

      // Get last contribution date
      let lastContribution = undefined;
      if (contributionsResult.documents.length > 0) {
        const sortedContribs = [...contributionsResult.documents].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        lastContribution = sortedContribs[0].created_at;
      }

      return {
        totalContributed,
        currentRotationContributed: !!currentRotationContrib,
        lastContribution
      };
    } catch (error) {
      console.error('Error getting user contribution status:', error);
      return {
        totalContributed: 0,
        currentRotationContributed: false
      };
    }
  }
}

export const groupService = new GroupService();
export default groupService;
