import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const washrooms = await prisma.washroom.findMany({
      include: {
        assignments: {
          include: {
            supervisor: true,
            generalManager: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    const formatted = washrooms.map((washroom) => ({
      id: washroom.assignments[0]?.id || null,

      washroom: {
        id: washroom.id,
        name: washroom.name,
        code: washroom.code,
        floor: washroom.floor,
      },

      supervisor:
        washroom.assignments[0]?.supervisor || {
          id: 0,
          name: "",
          email: "",
          phone: "",
        },

      generalManager:
        washroom.assignments[0]?.generalManager || {
          id: 0,
          name: "",
          email: "",
          phone: "",
        },

      supervisorExtraEmails:
        washroom.assignments[0]
          ?.supervisorExtraEmails || "",

      supervisorExtraPhones:
        washroom.assignments[0]
          ?.supervisorExtraPhones || "",

      gmExtraEmails:
        washroom.assignments[0]
          ?.gmExtraEmails || "",

      gmExtraPhones:
        washroom.assignments[0]
          ?.gmExtraPhones || "",

      ownerEmails:
        washroom.assignments[0]
          ?.ownerEmails || "",

      ownerPhones:
        washroom.assignments[0]
          ?.ownerPhones || "",
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error(
      "ASSIGNMENT GET ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to fetch assignments",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json()

    const existing =
      await prisma.washroomAssignment.findUnique(
        {
          where: {
            washroomId:
              body.washroomId,
          },
        }
      )

    if (existing) {
      const updated =
        await prisma.washroomAssignment.update(
          {
            where: {
              washroomId:
                body.washroomId,
            },
            data: {
              supervisorId:
                body.supervisorId,

              generalManagerId:
                body.generalManagerId,

              supervisorExtraEmails:
                body.supervisorExtraEmails ||
                null,

              supervisorExtraPhones:
                body.supervisorExtraPhones ||
                null,

              gmExtraEmails:
                body.gmExtraEmails ||
                null,

              gmExtraPhones:
                body.gmExtraPhones ||
                null,

              ownerEmails:
                body.ownerEmails ||
                null,

              ownerPhones:
                body.ownerPhones ||
                null,
            },
          }
        )

      return NextResponse.json(
        updated
      )
    }

    const created =
      await prisma.washroomAssignment.create(
        {
          data: {
            washroomId:
              body.washroomId,

            supervisorId:
              body.supervisorId,

            generalManagerId:
              body.generalManagerId,

            supervisorExtraEmails:
              body.supervisorExtraEmails ||
              null,

            supervisorExtraPhones:
              body.supervisorExtraPhones ||
              null,

            gmExtraEmails:
              body.gmExtraEmails ||
              null,

            gmExtraPhones:
              body.gmExtraPhones ||
              null,

            ownerEmails:
              body.ownerEmails ||
              null,

            ownerPhones:
              body.ownerPhones ||
              null,
          },
        }
      )

    return NextResponse.json(created)
  } catch (error) {
    console.error(
      "ASSIGNMENT SAVE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to save assignment",
      },
      { status: 500 }
    )
  }
}