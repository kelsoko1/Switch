# Users Collection Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "profile_photo" --type "string" --size 255 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "last_login" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "preferred_language" --type "string" --size 10 --required false --default "sw"
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "notifications_enabled" --type "boolean" --required false --default true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "users" --key "updated_at" --type "datetime" --required true

# Groups Collection Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "group_photo" --type "string" --size 255 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "location" --type "string" --size 255 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "total_members" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "total_contributions" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "next_contribution_date" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "updated_at" --type "datetime" --required true

# Members Collection Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "contributions_made" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "last_contribution_date" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "next_contribution_date" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "notifications_enabled" --type "boolean" --required true --default true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "members" --key "updated_at" --type "datetime" --required true

# Create Indexes
appwrite databases create-index --database-id "68ac3f000002c33d8048" --collection-id "users" --key "created_at_idx" --type "key" --attributes "created_at"
appwrite databases create-index --database-id "68ac3f000002c33d8048" --collection-id "users" --key "role_idx" --type "key" --attributes "role"
appwrite databases create-index --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "created_at_idx" --type "key" --attributes "created_at"
appwrite databases create-index --database-id "68ac3f000002c33d8048" --collection-id "groups" --key "status_idx" --type "key" --attributes "status"

# Update Collection Permissions
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "users" --name "Users" --permissions "read(\"any\")" "write(\"users\")" "update(\"users\")" "delete(\"team:admin\")"
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "groups" --name "Groups" --permissions "read(\"any\")" "write(\"users\")" "update(\"team:kiongozi\")" "delete(\"team:admin\")"
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "members" --name "Members" --permissions "read(\"users\")" "write(\"team:kiongozi\")" "update(\"team:kiongozi\")" "delete(\"team:kiongozi\")"
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "transactions" --name "Transactions" --permissions "read(\"users\")" "write(\"users\")" "update(\"team:admin\")" "delete(\"team:admin\")"
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "wallets" --name "Wallets" --permissions "read(\"users\")" "write(\"users\")" "update(\"users\")" "delete(\"team:admin\")"
appwrite databases update-collection --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --name "Wallet Transactions" --permissions "read(\"users\")" "write(\"users\")" "update(\"team:admin\")" "delete(\"team:admin\")"

# Add Transaction Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "transactions" --key "payment_method" --type "string" --size 50 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "transactions" --key "payment_reference" --type "string" --size 255 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "transactions" --key "metadata" --type "string" --size 2000 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "transactions" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "transactions" --key "updated_at" --type "datetime" --required true

# Add Wallet Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "total_transactions" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "pending_balance" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "last_transaction_date" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "preferred_payment_method" --type "string" --size 50 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallets" --key "updated_at" --type "datetime" --required true

# Add Wallet Transaction Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "transaction_type" --type "string" --size 50 --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "previous_balance" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "new_balance" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "metadata" --type "string" --size 2000 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "wallet_transactions" --key "updated_at" --type "datetime" --required true

# Add Overdraft Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "interest_rate" --type "integer" --required true --min 0 --default 10
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "total_repayment" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "remaining_balance" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "last_payment_date" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "payment_schedule" --type "string" --size 2000 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "overdrafts" --key "updated_at" --type "datetime" --required true

# Add WhatsApp Message Attributes
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "template_name" --type "string" --size 255 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "template_language" --type "string" --size 10 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "template_params" --type "string" --size 2000 --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "retry_count" --type "integer" --required true --min 0 --default 0
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "next_retry_at" --type "datetime" --required false
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "created_at" --type "datetime" --required true
appwrite databases create-attribute --database-id "68ac3f000002c33d8048" --collection-id "whatsapp_messages" --key "updated_at" --type "datetime" --required true

Write-Host "Collection updates completed!"
