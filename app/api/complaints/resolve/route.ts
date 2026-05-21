import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supervisor = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!supervisor || supervisor.role !== "SUPERVISOR") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: body.complaintId,
      },
    })

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      )
    }

    await prisma.complaint.update({
      where: {
        id: complaint.id,
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedById: supervisor.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("RESOLVE ERROR:", error)

    return NextResponse.json(
      { error: "Resolve failed" },
      { status: 500 }
    )
  }
}