import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const washroom = await prisma.washroom.findUnique({
      where: {
        code,
      },
    })

    if (!washroom) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(washroom)
  } catch {
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    )
  }
}