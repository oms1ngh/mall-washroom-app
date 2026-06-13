import nodemailer from "nodemailer"

const SMS_BASE =
  "http://sms.heightsconsultancy.com/api/mt/SendSMS"

const LOGIN_URL =
  "https://feedback.southavenuemall.com/login"

function parseList(input?: string) {
  if (!input) return []

  return input
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatTime(date?: Date) {
  return new Date(
    date || new Date()
  ).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function smsSafeText(
  text: string,
  maxLength = 30
) {
  if (!text) {
    return "No details"
  }

  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text
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
  createdAt?: Date
) {
  const phoneList =
    parseList(numbers)

  const time =
    formatTime(createdAt)

  const shortIssue =
  smsSafeText(issue)

  await Promise.all(
    phoneList.map((phone) => {
      const message =
  `SAM: नई वॉशरूम शिकायत। ` +
  `आईडी: ${complaintId} ` +
  `वॉशरूम: ${washroomName} ` +
  `समय: ${time} ` +
  `विवरण: ${shortIssue} ` +
  `लॉगिन: ${LOGIN_URL}`

      const url =
  `${SMS_BASE}?user=JECSAM` +
  `&password=Password` +
  `&senderid=JECSAM` +
  `&channel=TRANS` +
  `&DCS=8` +
  `&flashsms=0` +
  `&number=${phone}` +
  `&text=${encodeURIComponent(message)}` +
  `&route=6` +
  `&DLTTemplateId=1707178029562203182` +
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
  createdAt?: Date
) {
  const phoneList =
    parseList(numbers)

  const time =
    formatTime(createdAt)
    const shortIssue =
  smsSafeText(issue)


  await Promise.all(
    phoneList.map((phone) => {
      const message =
  `SAM: शिकायत 15 मिनट से लंबित। ` +
  `आईडी: ${complaintId} ` +
  `वॉशरूम: ${washroomName} ` +
  `समय: ${time} ` +
  `विवरण: ${shortIssue} ` +
  `लॉगिन: ${LOGIN_URL}`

      const url =
  `${SMS_BASE}?user=JECSAM` +
  `&password=Password` +
  `&senderid=JECSAM` +
  `&channel=TRANS` +
  `&DCS=8` +
  `&flashsms=0` +
  `&number=${phone}` +
  `&text=${encodeURIComponent(message)}` +
  `&route=6` +
  `&DLTTemplateId=1707178029569175753` +
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
  createdAt?: Date
) {
  const phoneList =
    parseList(numbers)

  const time =
    formatTime(createdAt)
    const shortIssue =
  smsSafeText(issue)

  await Promise.all(
    phoneList.map((phone) => {
      const message =
  `SAM क्रिटिकल अलर्ट: शिकायत 30 मिनट से लंबित। ` +
  `आईडी: ${complaintId} ` +
  `वॉशरूम: ${washroomName} ` +
  `समय: ${time} ` +
  `विवरण: ${shortIssue} ` +
  `लॉगिन: ${LOGIN_URL}`

      const url =
  `${SMS_BASE}?user=JECSAM` +
  `&password=Password` +
  `&senderid=JECSAM` +
  `&channel=TRANS` +
  `&DCS=8` +
  `&flashsms=0` +
  `&number=${phone}` +
  `&text=${encodeURIComponent(message)}` +
  `&route=6` +
  `&DLTTemplateId=1707178029575076414` +
  `&PEID=1701160257275217983`

      return callSms(url)
    })
  )
}