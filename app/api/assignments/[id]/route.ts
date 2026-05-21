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

    const updated = await prisma.washroomAssignment.update({
      where: {
        id: Number(id),
      },
      data: {
        supervisorId: Number(body.supervisorId),
        generalManagerId: Number(body.generalManagerId),
      },
    })

    return NextResponse.json({
      success: true,
      assignment: updated,
    })
  } catch (error) {
    console.error("ASSIGNMENT UPDATE ERROR:", error)

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

    await prisma.washroomAssignment.delete({
      where: {
        id: Number(id),
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("ASSIGNMENT DELETE ERROR:", error)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}