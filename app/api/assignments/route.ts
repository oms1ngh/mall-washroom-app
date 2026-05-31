
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const washrooms =
      await prisma.washroom.findMany({
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

    const formatted = washrooms.map(
      (washroom) => ({
        washroom: {
          id: washroom.id,
          name: washroom.name,
          code: washroom.code,
          floor: washroom.floor,
        },

        assignments:
          washroom.assignments.map(
            (assignment) => ({
              id: assignment.id,

              supervisor:
                assignment.supervisor,

              generalManager:
                assignment.generalManager,

              supervisorExtraEmails:
                assignment.supervisorExtraEmails ||
                "",

              supervisorExtraPhones:
                assignment.supervisorExtraPhones ||
                "",

              gmExtraEmails:
                assignment.gmExtraEmails ||
                "",

              gmExtraPhones:
                assignment.gmExtraPhones ||
                "",

              ownerEmails:
                assignment.ownerEmails ||
                "",

              ownerPhones:
                assignment.ownerPhones ||
                "",
            })
          ),
      })
    )

    return NextResponse.json(
      formatted
    )
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

    // UPDATE EXISTING ASSIGNMENT
    if (body.id) {
      const updated =
        await prisma.washroomAssignment.update(
          {
            where: {
              id: body.id,
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

    // CREATE NEW ASSIGNMENT
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

    return NextResponse.json(
      created
    )
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

export async function DELETE(
  req: Request
) {
  try {
    const body = await req.json()

    await prisma.washroomAssignment.delete(
      {
        where: {
          id: body.id,
        },
      }
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      "ASSIGNMENT DELETE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to delete assignment",
      },
      { status: 500 }
    )
  }
}




