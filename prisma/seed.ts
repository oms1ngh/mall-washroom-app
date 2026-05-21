import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("Temp@123", 10)

  // USERS

  const superAdmin = await prisma.user.upsert({
    where: {
      email: "admin@southavenuemall.com",
    },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@southavenuemall.com",
      phone: "9999999991",
      passwordHash: password,
      role: "SUPER_ADMIN",
    },
  })

  const owner1 = await prisma.user.upsert({
    where: {
      email: "pankaj.maheshwari@southavenuemall.com",
    },
    update: {},
    create: {
      name: "Pankaj Maheshwari",
      email: "pankaj.maheshwari@southavenuemall.com",
      phone: "9999999992",
      passwordHash: password,
      role: "OWNER",
    },
  })

  const owner2 = await prisma.user.upsert({
    where: {
      email: "vmohan@gokuldas.com",
    },
    update: {},
    create: {
      name: "V Mohan",
      email: "vmohan@gokuldas.com",
      phone: "9999999993",
      passwordHash: password,
      role: "OWNER",
    },
  })

  const gmMall = await prisma.user.upsert({
    where: {
      email: "mallgm@southavenuemall.com",
    },
    update: {},
    create: {
      name: "Mall GM",
      email: "mallgm@southavenuemall.com",
      phone: "9999999994",
      passwordHash: password,
      role: "GENERAL_MANAGER",
    },
  })

  const gmMovie = await prisma.user.upsert({
    where: {
      email: "abhishek.goswami@movie-magic.in",
    },
    update: {},
    create: {
      name: "Abhishek Goswami",
      email: "abhishek.goswami@movie-magic.in",
      phone: "9999999995",
      passwordHash: password,
      role: "GENERAL_MANAGER",
    },
  })

  const sup1 = await prisma.user.upsert({
    where: {
      email: "sup1@southavenuemall.com",
    },
    update: {},
    create: {
      name: "Supervisor 1",
      email: "sup1@southavenuemall.com",
      phone: "9999999996",
      passwordHash: password,
      role: "SUPERVISOR",
    },
  })

  const sup2 = await prisma.user.upsert({
    where: {
      email: "sup2@southavenuemall.com",
    },
    update: {},
    create: {
      name: "Supervisor 2",
      email: "sup2@southavenuemall.com",
      phone: "9999999997",
      passwordHash: password,
      role: "SUPERVISOR",
    },
  })

  // WASHROOMS

  const washrooms = [
    {
      code: "GF-G",
      name: "Ground Floor - Gents",
      floor: "Ground Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "GF-L",
      name: "Ground Floor - Ladies",
      floor: "Ground Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "ATR-G",
      name: "Atrium Floor - Gents",
      floor: "Atrium Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "ATR-L",
      name: "Atrium Floor - Ladies",
      floor: "Atrium Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "FF-G",
      name: "First Floor - Gents",
      floor: "First Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "FF-L",
      name: "First Floor - Ladies",
      floor: "First Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "SF-G",
      name: "Second Floor - Gents",
      floor: "Second Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "SF-L",
      name: "Second Floor - Ladies",
      floor: "Second Floor",
      supervisorId: sup1.id,
      gmId: gmMall.id,
    },
    {
      code: "MM-G",
      name: "Movie Magic - Gents",
      floor: "Movie Magic",
      supervisorId: sup2.id,
      gmId: gmMovie.id,
    },
    {
      code: "MM-L",
      name: "Movie Magic - Ladies",
      floor: "Movie Magic",
      supervisorId: sup2.id,
      gmId: gmMovie.id,
    },
    {
      code: "RMM-G",
      name: "Ruby Movie Magic - Gents",
      floor: "Ruby Movie Magic",
      supervisorId: sup2.id,
      gmId: gmMovie.id,
    },
    {
      code: "RMM-L",
      name: "Ruby Movie Magic - Ladies",
      floor: "Ruby Movie Magic",
      supervisorId: sup2.id,
      gmId: gmMovie.id,
    },
  ]

  for (const w of washrooms) {
    const washroom = await prisma.washroom.upsert({
      where: {
        code: w.code,
      },
      update: {
        name: w.name,
        floor: w.floor,
        active: true,
      },
      create: {
        code: w.code,
        name: w.name,
        floor: w.floor,
        active: true,
      },
    })

    await prisma.washroomAssignment.upsert({
      where: {
        washroomId: washroom.id,
      },
      update: {
        supervisorId: w.supervisorId,
        generalManagerId: w.gmId,
      },
      create: {
        washroomId: washroom.id,
        supervisorId: w.supervisorId,
        generalManagerId: w.gmId,
      },
    })
  }

  console.log("REAL MALL CONFIG SEEDED SUCCESSFULLY")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })