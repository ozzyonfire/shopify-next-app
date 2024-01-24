-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "scope" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineAccessInfo" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "expiresIn" INTEGER NOT NULL,
    "associatedUserScope" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineAccessInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociatedUser" (
    "id" TEXT NOT NULL,
    "onlineAccessInfoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountOwner" BOOLEAN NOT NULL,
    "locale" TEXT NOT NULL,
    "collaborator" BOOLEAN NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,

    CONSTRAINT "AssociatedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnlineAccessInfo_sessionId_key" ON "OnlineAccessInfo"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssociatedUser_onlineAccessInfoId_key" ON "AssociatedUser"("onlineAccessInfoId");

-- AddForeignKey
ALTER TABLE "OnlineAccessInfo" ADD CONSTRAINT "OnlineAccessInfo_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssociatedUser" ADD CONSTRAINT "AssociatedUser_onlineAccessInfoId_fkey" FOREIGN KEY ("onlineAccessInfoId") REFERENCES "OnlineAccessInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
