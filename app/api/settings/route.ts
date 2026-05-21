import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findFirst()

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const existing = await prisma.systemSetting.findFirst()

    if (existing) {
      const updated = await prisma.systemSetting.update({
        where: {
          id: existing.id,
        },
        data: {
          supervisorTimeout: body.supervisorTimeout,
          gmTimeout: body.gmTimeout,

          smsApiUrl: body.smsApiUrl,
          smsApiKey: body.smsApiKey,
          smsSenderId: body.smsSenderId,
          smsTemplateId: body.smsTemplateId,

          smtpHost: body.smtpHost,
          smtpPort: body.smtpPort,
          smtpUser: body.smtpUser,
          smtpPassword: body.smtpPassword,
        },
      })

      return NextResponse.json(updated)
    }

    const created = await prisma.systemSetting.create({
      data: {
        supervisorTimeout: body.supervisorTimeout,
        gmTimeout: body.gmTimeout,

        smsApiUrl: body.smsApiUrl,
        smsApiKey: body.smsApiKey,
        smsSenderId: body.smsSenderId,
        smsTemplateId: body.smsTemplateId,

        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort,
        smtpUser: body.smtpUser,
        smtpPassword: body.smtpPassword,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}