import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const emailsToDelete = [
    "testttt@southavenuemall.com",
    "testsup@southavenuemall.com",
    "omsingh.srit@gmail.com",
    "sup3@southavenuemall.com",
    "sup4@southavenuemall.com",
    "sup5@southavenuemall.com",
    "gm1@southavenuemall.com",
    "gm2@southavenuemall.com",
    "owner@southavenuemall.com",
  ]

  await prisma.user.deleteMany({
    where: {
      email: {
        in: emailsToDelete,
      },
    },
  })

  console.log("OLD TEST USERS REMOVED")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })