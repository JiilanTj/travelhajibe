-- Drop all tables in correct order
DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "AgentTiers" CASCADE;
DROP TABLE IF EXISTS "Packages" CASCADE;
DROP TABLE IF EXISTS "BlogPosts" CASCADE;
DROP TABLE IF EXISTS "BlogCategories" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "enum_Users_role" CASCADE;
DROP TYPE IF EXISTS "enum_Users_gender" CASCADE;
DROP TYPE IF EXISTS "enum_Users_maritalStatus" CASCADE;
DROP TYPE IF EXISTS "enum_Users_bloodType" CASCADE;
DROP TYPE IF EXISTS "enum_Packages_type" CASCADE;
DROP TYPE IF EXISTS "enum_BlogPosts_status" CASCADE; 