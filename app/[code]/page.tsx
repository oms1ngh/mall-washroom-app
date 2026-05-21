"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import FeedbackForm from "@/components/FeedbackForm"

export default function WashroomPage() {
  const params = useParams()
  const code = params.code as string

  const [washroom, setWashroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWashroom() {
      try {
        const res = await fetch(`/api/washrooms/code/${code}`)

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
    return <div>Loading...</div>
  }

  if (!washroom) {
    return <div>Invalid washroom QR</div>
  }

  return <FeedbackForm washroom={washroom} />
}