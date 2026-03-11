-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "readingTime" INTEGER,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
