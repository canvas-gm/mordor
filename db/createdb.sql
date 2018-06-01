CREATE TABLE IF NOT EXISTS "users" (
"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
"login" VARCHAR(50) NOT NULL,
"email" VARCHAR(255) NOT NULL,
"password" VARCHAR(255) NOT NULL,
"token" CHAR(8) NOT NULL,
"is_active" BOOLEAN DEFAULT 0
);