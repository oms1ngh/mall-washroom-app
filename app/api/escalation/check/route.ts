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

const assignments =
  await prisma.washroomAssignment.findMany(
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

if (
  assignments.length === 0
) {
  continue
}



      
if (
  assignments.length === 0
) {
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
       
const uniqueGMEmails =
  [
    ...new Set(
      assignments.flatMap((a) =>
        [
          a.generalManager
            ?.email,

          a.gmExtraEmails,
        ].filter(Boolean)
      )
    ),
  ]

const uniqueGMPhones =
  [
    ...new Set(
      assignments.flatMap((a) =>
        [
          a.generalManager
            ?.phone,

          a.gmExtraPhones,
        ].filter(Boolean)
      )
    ),
  ]

const gmEmails =
  uniqueGMEmails.join(",")

const gmPhones =
  uniqueGMPhones.join(",")

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
    `South Avenue Mall - शिकायत एस्केलेशन | ${complaint.complaintId}`,

  html: `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2 style="color:#ea580c;">
        South Avenue Mall - शिकायत एस्केलेशन सूचना
      </h2>

      <p>
        यह शिकायत पिछले 15 मिनट से लंबित है और अब GM स्तर पर एस्केलेट की गई है।
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
        कृपया लॉगिन करके शिकायत पर आवश्यक कार्रवाई करें।
      </p>

      <hr/>

      <p style="color:#ea580c;font-weight:bold;">
        यदि अगले 15 मिनट में शिकायत का समाधान नहीं हुआ,
        तो यह शिकायत Owner स्तर पर एस्केलेट हो जाएगी।
      </p>
    </div>
  `,
})

        await sendGMSMS(
          gmPhones,
          complaint.complaintId,
          complaint.washroomName,
          complaint.issueDescription ||
            "No details",
          complaint.createdAt
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
       
const uniqueOwnerEmails =
  [
    ...new Set(
      assignments.flatMap((a) =>
        (
          a.ownerEmails || ""
        )
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      )
    ),
  ]

const uniqueOwnerPhones =
  [
    ...new Set(
      assignments.flatMap((a) =>
        (
          a.ownerPhones || ""
        )
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      )
    ),
  ]

const ownerEmails =
  uniqueOwnerEmails.join(",")

const ownerPhones =
  uniqueOwnerPhones.join(",")



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
    `South Avenue Mall - क्रिटिकल शिकायत अलर्ट | ${complaint.complaintId}`,

  html: `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2 style="color:#b91c1c;">
        South Avenue Mall - क्रिटिकल शिकायत अलर्ट
      </h2>

      <p>
        यह शिकायत 30 मिनट से अधिक समय से लंबित है और अब Owner स्तर पर एस्केलेट हो चुकी है।
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
        कृपया इस शिकायत पर तत्काल ध्यान दें और आवश्यक कार्रवाई सुनिश्चित करें।
      </p>

      <hr/>

      <p style="color:#b91c1c;font-weight:bold;">
        यह एक क्रिटिकल एस्केलेशन है और तत्काल हस्तक्षेप अपेक्षित है।
      </p>
    </div>
  `,
})

        await sendOwnerSMS(
          ownerPhones,
          complaint.complaintId,
          complaint.washroomName,
          complaint.issueDescription ||
            "No details",
          complaint.createdAt
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