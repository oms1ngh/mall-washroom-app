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

    const supervisorDashboardLink =
      "https://feedback.southavenuemall.com/dashboard/supervisor"

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

    const assignments =
  await prisma.washroomAssignment.findMany({
    where: {
      washroomId:
        washroom.id,
    },
    include: {
      supervisor: true,
      generalManager: true,
    },
  })

    const cleanlinessStatus =
      body.cleanlinessStatus ===
      "Very Clean"
        ? "VERY_CLEAN"
        : body.cleanlinessStatus ===
          "Clean" ||
          body.cleanlinessStatus ===
            "Clean but toiletries unavailable"
        ? "CLEAN"
        : body.cleanlinessStatus ===
          "Not Clean"
        ? "NOT_CLEAN"
        : "DIRTY"

    const toiletriesUnavailable =
      body.cleanlinessStatus ===
      "Clean but toiletries unavailable"

    const autoResolved =
      !toiletriesUnavailable &&
      cleanlinessStatus !== "NOT_CLEAN" &&
      cleanlinessStatus !== "DIRTY" &&
      body.facilitiesWorking === "Yes"

    const submittedIssue =
      body.issueDescription ||
      body.feedback ||
      body.comment ||
      body.comments ||
      null

    const issueDescription =
      toiletriesUnavailable
        ? [
            submittedIssue,
            "Clean washroom, toiletries unavailable",
          ]
            .filter(Boolean)
            .join(". ")
        : submittedIssue

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

          issueDescription,

          status: autoResolved
            ? "POSITIVE_FEEDBACK"
            : "OPEN",

          resolvedAt: null,

          supervisorNotified:
  !autoResolved &&
  assignments.length > 0,
        },
        include: {
          washroom: true,
        },
      })


if (
  !autoResolved &&
  assignments.length > 0
) {

  // SEND NOTIFICATIONS IN BACKGROUND
  Promise.all(

    assignments.map(
      async (assignment) => {

        try {

          const supervisorEmails =
            [
              assignment
                .supervisor.email,

              assignment
                .supervisorExtraEmails,
            ]
              .filter(Boolean)
              .join(",")

          const supervisorPhones =
            [
              assignment
                .supervisor.phone,

              assignment
                .supervisorExtraPhones,
            ]
              .filter(Boolean)
              .join(",")

          await sendEmail({
            to: supervisorEmails,

            subject:
              `South Avenue Mall - नई वॉशरूम शिकायत | ${complaint.complaintId}`,

            
html: `
  <div style="font-family: Arial, sans-serif; padding:20px;">
    <h2 style="color:#dc2626;">
      South Avenue Mall - नई वॉशरूम शिकायत
    </h2>

    <p>
      वॉशरूम से नई शिकायत प्राप्त हुई है।
    </p>

    <p>
      <strong>शिकायत आईडी:</strong>
      ${complaint.complaintId}
    </p>

    <p>
      <strong>वॉशरूम:</strong>
      ${complaint.washroomName}
    </p>

    <p>
      <strong>समय:</strong>
      ${complaint.createdAt.toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )}
    </p>

    <p>
      <strong>विवरण:</strong>
      ${
        complaint.issueDescription ||
        "कोई विवरण उपलब्ध नहीं"
      }
    </p>

    <p>
      <strong>लॉगिन:</strong><br/>
      <a href="https://feedback.southavenuemall.com/login">
        https://feedback.southavenuemall.com/login
      </a>
    </p>

    <p>
      कृपया लॉगिन करके शिकायत का समाधान करें।
    </p>

    <hr/>

    <p style="color:red;font-weight:bold;">
      कृपया 15 मिनट के भीतर शिकायत का समाधान करें।
      15 मिनट के बाद शिकायत स्वतः GM को एस्केलेट हो जाएगी।
    </p>
  </div>
`,

          })

          await sendSupervisorSMS(
            supervisorPhones,

            complaint.complaintId,

            complaint.washroomName,

            complaint.issueDescription ||
              "No details",

            complaint.createdAt
          )

        } catch (notificationError) {

          console.error(
            "NOTIFICATION ERROR:",
            notificationError
          )
        }
      }
    )
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
