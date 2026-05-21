import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()

    const updated = await prisma.washroom.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name,
        code: body.code,
        floor: body.floor,
        active: body.active,
      },
    })

    return NextResponse.json({
      success: true,
      washroom: updated,
    })
  } catch (error) {
    console.error("WASHROOM UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const washroomId = Number(id)

    const washroom = await prisma.washroom.findUnique({
      where: {
        id: washroomId,
      },
      include: {
        assignments: true,
        complaints: true,
      },
    })

    if (!washroom) {
      return NextResponse.json(
        { error: "Washroom not found" },
        { status: 404 }
      )
    }

    // Block delete only if complaint history exists
    if (washroom.complaints.length > 0) {
      return NextResponse.json(
        {
          error:
            "Washroom has complaint history. Deactivate instead.",
        },
        { status: 400 }
      )
    }

    // Remove assignments automatically
    if (washroom.assignments.length > 0) {
      await prisma.washroomAssignment.deleteMany({
        where: {
          washroomId,
        },
      })
    }

    // Delete washroom
    await prisma.washroom.delete({
      where: {
        id: washroomId,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("WASHROOM DELETE ERROR:", error)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}