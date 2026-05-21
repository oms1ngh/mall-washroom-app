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
  floor: string,
  issue: string
) {
  const phoneList =
    parseList(numbers)

  await Promise.all(
  phoneList.map((phone) => {
    const url =
      `${SMS_BASE}?user=moviem` +
      `&password=Password@1` +
      `&senderid=MOVIEM` +
      `&channel=TRANS` +
      `&DCS=0` +
      `&flashsms=0` +
      `&number=${phone}` +
      `&text=Alert:%20New%20washroom%20complaint%20received.%20ID:%20${complaintId}%20Washroom:%20${washroomName}%20Floor:%20${floor}%20Issue:%20${issue}%20Please%20resolve%20within%2015%20minutes%20to%20avoid%20escalation.%20MOVIEM` +
      `&route=15` +
      `&DLTTemplateId=1707177933910108666` +
      `&PEID=1701160257275217983`

    return callSms(url)
  })
)
}

export async function sendGMSMS(
  numbers: string,
  complaintId: string,
  washroomName: string,
  floor: string,
  issue: string
) {
  const phoneList =
    parseList(numbers)

  for (const phone of phoneList) {
    const url =
      `${SMS_BASE}?user=moviem` +
      `&password=Password@1` +
      `&senderid=MOVIEM` +
      `&channel=TRANS` +
      `&DCS=0` +
      `&flashsms=0` +
      `&number=${phone}` +
      `&text=Escalation%20Alert:%20Washroom%20complaint%20unresolved%20for%2015%20minutes.%20ID:%20${complaintId}%20Washroom:%20${washroomName}%20Floor:%20${floor}%20Issue:%20${issue}%20Supervisor%20action%20pending.%20Immediate%20intervention%20required.%20MOVIEM` +
      `&route=15` +
      `&DLTTemplateId=1707177934207573791` +
      `&PEID=1701160257275217983`

    await callSms(url)
  }
}

export async function sendOwnerSMS(
  numbers: string,
  complaintId: string,
  washroomName: string,
  floor: string,
  issue: string
) {
  const phoneList =
    parseList(numbers)

  for (const phone of phoneList) {
    const url =
      `${SMS_BASE}?user=moviem` +
      `&password=Password@1` +
      `&senderid=MOVIEM` +
      `&channel=TRANS` +
      `&DCS=0` +
      `&flashsms=0` +
      `&number=${phone}` +
      `&text=Critical%20Alert:%20Washroom%20complaint%20unresolved%20for%2030%20minutes.%20ID:%20${complaintId}%20Washroom:%20${washroomName}%20Floor:%20${floor}%20Issue:%20${issue}%20GM%20escalation%20unsuccessful.%20Immediate%20management%20action%20required.%20MOVIEM` +
      `&route=6` +
      `&DLTTemplateId=1707177934222280533` +
      `&PEID=1701160257275217983`

    await callSms(url)
  }
}