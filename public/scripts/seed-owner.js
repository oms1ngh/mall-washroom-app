const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10)

  console.log("Cleaning database...")

  await prisma.notificationLog.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.washroomAssignment.deleteMany()
  await prisma.washroom.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.user.deleteMany()

  console.log("Creating users...")

  // SUPER ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@southavenuemall.com",
      phone: "9999999999",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  })

  // OWNER (VIEW ONLY)
  const owner = await prisma.user.create({
    data: {
      name: "Mall Owner",
      email: "owner@southavenuemall.com",
      phone: "9999999998",
      passwordHash,
      role: "OWNER",
    },
  })

  // GENERAL MANAGERS
  const gm1 = await prisma.user.create({
    data: {
      name: "General Manager 1",
      email: "gm1@southavenuemall.com",
      phone: "9000000001",
      passwordHash,
      role: "GENERAL_MANAGER",
    },
  })

  const gm2 = await prisma.user.create({
    data: {
      name: "General Manager 2",
      email: "gm2@southavenuemall.com",
      phone: "9000000002",
      passwordHash,
      role: "GENERAL_MANAGER",
    },
  })

  // SUPERVISORS
  const sup1 = await prisma.user.create({
    data: {
      name: "Supervisor 1",
      email: "sup1@southavenuemall.com",
      phone: "9000000011",
      passwordHash,
      role: "SUPERVISOR",
    },
  })

  const sup2 = await prisma.user.create({
    data: {
      name: "Supervisor 2",
      email: "sup2@southavenuemall.com",
      phone: "9000000012",
      passwordHash,
      role: "SUPERVISOR",
    },
  })

  const sup3 = await prisma.user.create({
    data: {
      name: "Supervisor 3",
      email: "sup3@southavenuemall.com",
      phone: "9000000013",
      passwordHash,
      role: "SUPERVISOR",
    },
  })

  const sup4 = await prisma.user.create({
    data: {
      name: "Supervisor 4",
      email: "sup4@southavenuemall.com",
      phone: "9000000014",
      passwordHash,
      role: "SUPERVISOR",
    },
  })

  const sup5 = await prisma.user.create({
    data: {
      name: "Supervisor 5",
      email: "sup5@southavenuemall.com",
      phone: "9000000015",
      passwordHash,
      role: "SUPERVISOR",
    },
  })

  console.log("Creating washrooms...")

  const washrooms = await Promise.all([
    prisma.washroom.create({
      data: {
        code: "ATR_GENTS",
        name: "Atrium Floor - Gents",
        floor: "Atrium Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "ATR_LADIES",
        name: "Atrium Floor - Ladies",
        floor: "Atrium Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "FF_GENTS",
        name: "First Floor - Gents",
        floor: "First Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "FF_LADIES",
        name: "First Floor - Ladies",
        floor: "First Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "SF_GENTS",
        name: "Second Floor - Gents",
        floor: "Second Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "SF_LADIES",
        name: "Second Floor - Ladies",
        floor: "Second Floor",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "MM_GENTS",
        name: "Movie Magic - Gents",
        floor: "Movie Magic",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "MM_LADIES",
        name: "Movie Magic - Ladies",
        floor: "Movie Magic",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "RMM_GENTS",
        name: "Ruby Movie Magic - Gents",
        floor: "Ruby Movie Magic",
      },
    }),

    prisma.washroom.create({
      data: {
        code: "RMM_LADIES",
        name: "Ruby Movie Magic - Ladies",
        floor: "Ruby Movie Magic",
      },
    }),
  ])

  console.log("Creating assignments...")

  await prisma.washroomAssignment.createMany({
    data: [
      {
        washroomId: washrooms[0].id,
        supervisorId: sup1.id,
        generalManagerId: gm1.id,
      },
      {
        washroomId: washrooms[1].id,
        supervisorId: sup1.id,
        generalManagerId: gm1.id,
      },

      {
        washroomId: washrooms[2].id,
        supervisorId: sup2.id,
        generalManagerId: gm1.id,
      },
      {
        washroomId: washrooms[3].id,
        supervisorId: sup2.id,
        generalManagerId: gm1.id,
      },

      {
        washroomId: washrooms[4].id,
        supervisorId: sup3.id,
        generalManagerId: gm2.id,
      },
      {
        washroomId: washrooms[5].id,
        supervisorId: sup3.id,
        generalManagerId: gm2.id,
      },

      {
        washroomId: washrooms[6].id,
        supervisorId: sup4.id,
        generalManagerId: gm2.id,
      },
      {
        washroomId: washrooms[7].id,
        supervisorId: sup4.id,
        generalManagerId: gm2.id,
      },

      {
        washroomId: washrooms[8].id,
        supervisorId: sup5.id,
        generalManagerId: gm2.id,
      },
      {
        washroomId: washrooms[9].id,
        supervisorId: sup5.id,
        generalManagerId: gm2.id,
      },
    ],
  })

  console.log("Creating system settings...")

  await prisma.systemSetting.create({
    data: {
      supervisorTimeout: 15,
      gmTimeout: 30,
    },
  })

  console.log("Production seed completed successfully")
}

main()
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })