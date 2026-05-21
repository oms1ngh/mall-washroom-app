import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

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

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (
      user.email === "admin@southavenuemall.com" &&
      body.role &&
      body.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Cannot change admin role" },
        { status: 400 }
      )
    }

    let passwordHash = user.passwordHash

    if (body.password && body.password.trim() !== "") {
      passwordHash = await bcrypt.hash(
        body.password,
        10
      )
    }

    const updated = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name ?? user.name,
        email: body.email ?? user.email,
        phone: body.phone ?? user.phone,
        role: body.role ?? user.role,
        passwordHash,
        isActive:
          body.isActive !== undefined
            ? body.isActive
            : user.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      user: updated,
    })
  } catch (error) {
    console.error("PATCH USER ERROR:", error)

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

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        supervisorAssignments: true,
        gmAssignments: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.email === "admin@southavenuemall.com") {
      return NextResponse.json(
        { error: "Admin cannot be deleted" },
        { status: 400 }
      )
    }

    if (
      user.supervisorAssignments.length > 0 ||
      user.gmAssignments.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "User has active washroom assignments. Reassign first.",
        },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("DELETE USER ERROR:", error)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}