#!/bin/bash

# Users Collection
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key profile_photo --type string --size 255 --required false
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key last_login --type datetime --required false
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key preferred_language --type string --size 10 --required false --default sw
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key notifications_enabled --type boolean --required false --default true
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key created_at --type datetime --required true
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id users --key updated_at --type datetime --required true

# Groups Collection
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key group_photo --type string --size 255 --required false
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key location --type string --size 255 --required false
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key total_members --type integer --required true --min 0 --default 0
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key total_contributions --type integer --required true --min 0 --default 0
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key next_contribution_date --type datetime --required false
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key created_at --type datetime --required true
appwrite databases createAttribute --database-id 68ac3f000002c33d8048 --collection-id groups --key updated_at --type datetime --required true

# Create indexes
appwrite databases createIndex --database-id 68ac3f000002c33d8048 --collection-id users --key created_at_idx --type key --attributes created_at
appwrite databases createIndex --database-id 68ac3f000002c33d8048 --collection-id users --key role_idx --type key --attributes role
appwrite databases createIndex --database-id 68ac3f000002c33d8048 --collection-id groups --key created_at_idx --type key --attributes created_at
appwrite databases createIndex --database-id 68ac3f000002c33d8048 --collection-id groups --key status_idx --type key --attributes status

# Update permissions
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id users --read "users" --write "users" --name "Users"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id groups --read "users" --write "team:kiongozi" --name "Groups"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id members --read "users" --write "team:kiongozi" --name "Members"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id transactions --read "users" --write "users" --name "Transactions"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id wallets --read "users" --write "users" --name "Wallets"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id wallet_transactions --read "users" --write "users" --name "Wallet Transactions"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id overdrafts --read "users" --write "users" --name "Overdrafts"
appwrite databases updateCollection --database-id 68ac3f000002c33d8048 --collection-id whatsapp_messages --read "users" --write "users" --name "WhatsApp Messages"
