import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  sendEmail,
  sendSupervisorSMS,
} from "@/lib/mailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("Incoming:", body)

    const washroom =
      await prisma.washroom.findUnique({
        where: {
          code: body.washroomCode,
        },
      })

    if (!washroom) {
      return NextResponse.json(
        {
          error: "Washroom not found",
        },
        { status: 404 }
      )
    }

    const assignment =
      await prisma.washroomAssignment.findUnique(
        {
          where: {
            washroomId:
              washroom.id,
          },
          include: {
            supervisor: true,
            generalManager: true,
          },
        }
      )

    const cleanlinessStatus =
      body.cleanlinessStatus ===
      "Very Clean"
        ? "VERY_CLEAN"
        : body.cleanlinessStatus ===
          "Clean"
        ? "CLEAN"
        : body.cleanlinessStatus ===
          "Not Clean"
        ? "NOT_CLEAN"
        : "DIRTY"

    const autoResolved =
      cleanlinessStatus ===
        "VERY_CLEAN" ||
      cleanlinessStatus === "CLEAN"

    const complaint =
      await prisma.complaint.create({
        data: {
          complaintId:
            body.complaintId,

          washroomId:
            washroom.id,

          washroomCode:
            washroom.code,

          washroomName:
            washroom.name,

          floor:
            washroom.floor,

          cleanlinessStatus,

          facilitiesWorking:
            body.facilitiesWorking ===
            "Yes",

          issueDescription:
            body.issueDescription ||
            null,

          status: autoResolved
            ? "RESOLVED"
            : "OPEN",

          resolvedAt:
            autoResolved
              ? new Date()
              : null,

          supervisorNotified:
            !autoResolved &&
            !!assignment,
        },
        include: {
          washroom: true,
        },
      })

    if (
      !autoResolved &&
      assignment?.supervisor
    ) {
      const supervisorEmails =
        [
          assignment.supervisor.email,
          assignment.supervisorExtraEmails,
        ]
          .filter(Boolean)
          .join(",")

      const supervisorPhones =
        [
          assignment.supervisor.phone,
          assignment.supervisorExtraPhones,
        ]
          .filter(Boolean)
          .join(",")

     sendEmail({
        to: supervisorEmails,
        subject:
          "South Avenue Mall Service Notification",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>
              South Avenue Mall Service Notification
            </h2>

            <p>
              A new washroom service request has been recorded.
            </p>

            <p>
              <strong>Complaint ID:</strong>
              ${complaint.complaintId}
            </p>

            <p>
              <strong>Washroom:</strong>
              ${complaint.washroomName}
            </p>

            <p>
              <strong>Floor:</strong>
              ${complaint.floor}
            </p>

            <p>
              <strong>Cleanliness:</strong>
              ${complaint.cleanlinessStatus}
            </p>

            <p>
              <strong>Facilities Working:</strong>
              ${
                complaint.facilitiesWorking
                  ? "Yes"
                  : "No"
              }
            </p>

            <p>
              <strong>Issue:</strong>
              ${
                complaint.issueDescription ||
                "No details"
              }
            </p>

            <hr />

            <p style="color:red; font-weight:bold;">
              Please resolve within 15 minutes.
            </p>

            <p style="color:red; font-weight:bold;">
              If unresolved, escalation will be sent automatically.
            </p>
          </div>
        `,
      })

     sendSupervisorSMS(
        supervisorPhones,
        complaint.complaintId,
        complaint.washroomName,
        complaint.floor,
        complaint.issueDescription ||
          "No details"
      )
    }

    return NextResponse.json({
      success: true,
      complaint,
    })
  } catch (error) {
    console.error(
      "DATABASE ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      { status: 500 }
    )
  }
}