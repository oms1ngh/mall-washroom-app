import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  sendEmail,
  sendGMSMS,
  sendOwnerSMS,
} from "@/lib/mailer"

export async function GET() {
  try {
    const now = new Date()

    const gmDashboardLink =
      "https://feedback.southavenuemall.com/dashboard/gm"

    const ownerDashboardLink =
      "https://feedback.southavenuemall.com/dashboard/owner"

    const complaints =
      await prisma.complaint.findMany({
        where: {
          status: {
            in: [
              "OPEN",
              "ESCALATED_TO_GM",
            ],
          },
        },
      })

    for (const complaint of complaints) {
      const diffMinutes =
        (now.getTime() -
          complaint.createdAt.getTime()) /
        1000 /
        60

      const assignment =
        await prisma.washroomAssignment.findUnique(
          {
            where: {
              washroomId:
                complaint.washroomId,
            },
            include: {
              generalManager: true,
            },
          }
        )

      if (!assignment) {
        continue
      }

      /*
      GM ESCALATION
      */
      if (
        complaint.status === "OPEN" &&
        !complaint.gmNotified &&
        diffMinutes >= 15
      ) {
        const gmEmails =
          [
            assignment.generalManager
              ?.email,
            assignment.gmExtraEmails,
          ]
            .filter(Boolean)
            .join(",")

        const gmPhones =
          [
            assignment.generalManager
              ?.phone,
            assignment.gmExtraPhones,
          ]
            .filter(Boolean)
            .join(",")

        console.log(
          "GM EMAILS:",
          gmEmails
        )

        console.log(
          "GM PHONES:",
          gmPhones
        )

        await sendEmail({
          to: gmEmails,
          subject:
            "GM Escalation - Washroom Complaint Pending",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color:red;">
                GM Escalation Alert
              </h2>

              <p>
                Complaint unresolved for 15 minutes.
              </p>

              <p>
                <strong>ID:</strong>
                ${complaint.complaintId}
              </p>

              <p>
                <strong>Washroom:</strong>
                ${complaint.washroomName}
              </p>

              <p>
                <strong>Issue:</strong>
                ${
                  complaint.issueDescription ||
                  "No details"
                }
              </p>

              <p>
                <strong>Dashboard:</strong>
                <a href="${gmDashboardLink}">
                  ${gmDashboardLink}
                </a>
              </p>
            </div>
          `,
        })

        await sendGMSMS(
          gmPhones,
          complaint.complaintId,
          complaint.washroomName,
          complaint.issueDescription ||
            "No details"
        )

        await prisma.complaint.update({
          where: {
            id: complaint.id,
          },
          data: {
            gmNotified: true,
            status:
              "ESCALATED_TO_GM",
            currentLevel: 2,
          },
        })
      }

      /*
      OWNER ESCALATION
      */
      if (
        complaint.status ===
          "ESCALATED_TO_GM" &&
        !complaint.ownerNotified &&
        diffMinutes >= 30
      ) {
        const ownerEmails =
          assignment.ownerEmails || ""

        const ownerPhones =
          assignment.ownerPhones || ""

        console.log(
          "OWNER EMAILS:",
          ownerEmails
        )

        console.log(
          "OWNER PHONES:",
          ownerPhones
        )

        await sendEmail({
          to: ownerEmails,
          subject:
            "Critical Escalation - Washroom Complaint Pending",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color:red;">
                Critical Escalation Alert
              </h2>

              <p>
                Complaint unresolved for 30 minutes.
              </p>

              <p>
                <strong>ID:</strong>
                ${complaint.complaintId}
              </p>

              <p>
                <strong>Washroom:</strong>
                ${complaint.washroomName}
              </p>

              <p>
                <strong>Issue:</strong>
                ${
                  complaint.issueDescription ||
                  "No details"
                }
              </p>

              <p>
                <strong>Dashboard:</strong>
                <a href="${ownerDashboardLink}">
                  ${ownerDashboardLink}
                </a>
              </p>
            </div>
          `,
        })

        await sendOwnerSMS(
          ownerPhones,
          complaint.complaintId,
          complaint.washroomName,
          complaint.issueDescription ||
            "No details"
        )

        await prisma.complaint.update({
          where: {
            id: complaint.id,
          },
          data: {
            ownerNotified: true,
            status: "CRITICAL",
            currentLevel: 3,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      "ESCALATION ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Escalation failed",
      },
      { status: 500 }
    )
  }
}