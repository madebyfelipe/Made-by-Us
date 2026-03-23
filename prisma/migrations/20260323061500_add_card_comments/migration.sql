CREATE TABLE "CardComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mentionUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cardId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CardComment_cardId_idx" ON "CardComment"("cardId");
CREATE INDEX "CardComment_authorId_idx" ON "CardComment"("authorId");

ALTER TABLE "CardComment"
ADD CONSTRAINT "CardComment_cardId_fkey"
FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CardComment"
ADD CONSTRAINT "CardComment_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
