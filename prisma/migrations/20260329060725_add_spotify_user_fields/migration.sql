/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "spotifyAccessToken" TEXT,
ADD COLUMN     "spotifyId" TEXT,
ADD COLUMN     "spotifyRefreshToken" TEXT,
ADD COLUMN     "spotifyTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_spotifyId_key" ON "users"("spotifyId");
