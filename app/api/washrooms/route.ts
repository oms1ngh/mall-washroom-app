import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const washrooms = await prisma.washroom.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(washrooms)
  } catch (error) {
    console.error("WASHROOM GET ERROR:", error)

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const admin = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const washroom = await prisma.washroom.create({
      data: {
        code: body.code,
        name: body.name,
        floor: body.floor,
        active: true,
      },
    })

    return NextResponse.json({
      success: true,
      washroom,
    })
  } catch (error) {
    console.error("WASHROOM CREATE ERROR:", error)

    return NextResponse.json(
      { error: "Create failed" },
      { status: 500 }
    )
  }
}