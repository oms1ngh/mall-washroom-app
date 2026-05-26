"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"

export default function WashroomPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    if (code) {
      router.push(`/${code}`)
    } else {
      setLoading(false)
    }
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading
        ? "Loading..."
        : "Invalid washroom QR"}
    </div>
  )
}