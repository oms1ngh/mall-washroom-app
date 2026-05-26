import nodemailer from "nodemailer"

const SMS_BASE =
  "http://sms.heightsconsultancy.com/api/mt/SendSMS"

function parseList(input?: string) {
  if (!input) return []

  return input
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function sendEmail({
  to,
  subject,
  html,
  cc,
}: {
  to: string
  subject: string
  html: string
  cc?: string
}) {
  try {
    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user:
            "southavenuemall@gmail.com",
          pass:
            "egdu ubee kkql ckbk",
        },
      })

    const toList = parseList(to)
    const ccList = parseList(cc)

    const result =
      await transporter.sendMail({
        from:
          '"South Avenue Mall Alerts" <southavenuemall@gmail.com>',

        to: toList,

        cc:
          ccList.length > 0
            ? ccList
            : undefined,

        replyTo:
          "southavenuemall@gmail.com",

        subject,

        text:
          "South Avenue Mall notification",

        html,
      })

    console.log(
      "MAIL RESULT:",
      result
    )

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      "MAIL ERROR:",
      error
    )

    return {
      success: false,
    }
  }
}

async function callSms(url: string) {
  try {
    const res = await fetch(url)
    const data = await res.text()

    console.log(
      "SMS RESULT:",
      data
    )

    return true
  } catch (error) {
    console.error(
      "SMS ERROR:",
      error
    )
    return false
  }
}

export async function sendSupervisorSMS(
  numbers: string,
  complaintId: string,
  washroomName: string,
  issue: string,
  dashboardUrl: string
) {
  const phoneList =
    parseList(numbers)

  await Promise.all(
    phoneList.map((phone) => {
      const message =
        `साउथ एवेन्यू मॉल अलर्ट: ` +
        `नई वॉशरूम शिकायत प्राप्त हुई। ` +
        `आईडी: ${complaintId} ` +
        `वॉशरूम: ${washroomName} ` +
        `समस्या: ${issue} ` +
        `15 मिनट में समाधान करें। ` +
        `कृपया लॉगिन करके शिकायत का समाधान करें: ${dashboardUrl} ` +
        `MOVIEM`

      const url =
        `${SMS_BASE}?user=moviem` +
        `&password=Password@1` +
        `&senderid=MOVIEM` +
        `&channel=TRANS` +
        `&DCS=8` +
        `&flashsms=0` +
        `&number=${phone}` +
        `&text=${encodeURIComponent(
          message
        )}` +
        `&route=6` +
        `&DLTTemplateId=1707177953899344364` +
        `&PEID=1701160257275217983`

      return callSms(url)
    })
  )
}

export async function sendGMSMS(
  numbers: string,
  complaintId: string,
  washroomName: string,
  issue: string,
  dashboardUrl: string
) {
  const phoneList =
    parseList(numbers)

  await Promise.all(
    phoneList.map((phone) => {
      const message =
        `साउथ एवेन्यू मॉल एस्केलेशन: ` +
        `शिकायत 15 मिनट से लंबित है। ` +
        `आईडी: ${complaintId} ` +
        `वॉशरूम: ${washroomName} ` +
        `समस्या: ${issue} ` +
        `डैशबोर्ड: ${dashboardUrl} ` +
        `MOVIEM`

      const url =
        `${SMS_BASE}?user=moviem` +
        `&password=Password@1` +
        `&senderid=MOVIEM` +
        `&channel=TRANS` +
        `&DCS=8` +
        `&flashsms=0` +
        `&number=${phone}` +
        `&text=${encodeURIComponent(
          message
        )}` +
        `&route=6` +
        `&DLTTemplateId=1707177953946867784` +
        `&PEID=1701160257275217983`

      return callSms(url)
    })
  )
}

export async function sendOwnerSMS(
  numbers: string,
  complaintId: string,
  washroomName: string,
  issue: string,
  dashboardUrl: string
) {
  const phoneList =
    parseList(numbers)

  await Promise.all(
    phoneList.map((phone) => {
      const message =
        `साउथ एवेन्यू मॉल क्रिटिकल अलर्ट: ` +
        `शिकायत 30 मिनट से लंबित है। ` +
        `आईडी: ${complaintId} ` +
        `वॉशरूम: ${washroomName} ` +
        `समस्या: ${issue} ` +
        `डैशबोर्ड: ${dashboardUrl} ` +
        `MOVIEM`

      const url =
        `${SMS_BASE}?user=moviem` +
        `&password=Password@1` +
        `&senderid=MOVIEM` +
        `&channel=TRANS` +
        `&DCS=8` +
        `&flashsms=0` +
        `&number=${phone}` +
        `&text=${encodeURIComponent(
          message
        )}` +
        `&route=6` +
        `&DLTTemplateId=1707177953960434359` +
        `&PEID=1701160257275217983`

      return callSms(url)
    })
  )
}