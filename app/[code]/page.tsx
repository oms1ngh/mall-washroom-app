"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function WashroomPage() {
  const params = useParams()
  const code = params.code as string

  const [washroom, setWashroom] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function loadWashroom() {
      try {
        const res = await fetch(
          `/api/washrooms/code/${code}`
        )

        if (!res.ok) {
          setWashroom(null)
          return
        }

        const data = await res.json()
        setWashroom(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      loadWashroom()
    }
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    )
  }

  if (!washroom) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Invalid washroom QR
      </div>
    )
  }

  window.location.href = `/?washroomCode=${code}`

  return null
}