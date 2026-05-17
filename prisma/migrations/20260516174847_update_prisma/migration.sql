-- AlterTable
ALTER TABLE "_ConsultationToGroup" ADD CONSTRAINT "_ConsultationToGroup_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ConsultationToGroup_AB_unique";

-- AlterTable
ALTER TABLE "_SubjectToUser" ADD CONSTRAINT "_SubjectToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SubjectToUser_AB_unique";

-- AlterTable
ALTER TABLE "_supporters" ADD CONSTRAINT "_supporters_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_supporters_AB_unique";
