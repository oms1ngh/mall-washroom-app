"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import Image from "next/image"

type Complaint = {
  id: number
  complaintId: string
  washroomName: string
  floor: string
  cleanlinessStatus: string
  facilitiesWorking: boolean
  issueDescription: string | null
  complaintAgeMinutes: number
  escalationStage: string
}

export default function SupervisorDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState<number | null>(null)

  async function loadComplaints() {
    try {
      const res = await fetch("/api/dashboard/supervisor")
      const data = await res.json()
      setComplaints(data.complaints || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function resolveComplaint(id: number) {
    try {
      setResolvingId(id)

      await fetch("/api/complaints/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId: id,
        }),
      })

      loadComplaints()
    } catch (error) {
      console.error(error)
    } finally {
      setResolvingId(null)
    }
  }

  useEffect(() => {
    loadComplaints()

    const interval = setInterval(() => {
      loadComplaints()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/sam-logo.jpg"
              alt="South Avenue Mall"
              width={80}
              height={80}
              className="w-auto h-auto"
            />

            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
                Supervisor Dashboard
              </h1>

              <p className="text-slate-600">
                South Avenue Mall Washroom Monitoring System
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Active Complaints
        </h2>

        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-lg">
            No active complaints
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p>
                      <strong>ID:</strong> {c.complaintId}
                    </p>

                    <p>
                      <strong>Washroom:</strong> {c.washroomName}
                    </p>

                    <p>
                      <strong>Floor:</strong> {c.floor}
                    </p>

                    <p>
                      <strong>Cleanliness:</strong>{" "}
                      {c.cleanlinessStatus}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <strong>Facilities Working:</strong>{" "}
                      {c.facilitiesWorking ? "Yes" : "No"}
                    </p>

                    <p>
                      <strong>Issue:</strong>{" "}
                      {c.issueDescription || "No comment"}
                    </p>

                    <p className="text-lg font-semibold text-orange-600">
                      Complaint Age: {c.complaintAgeMinutes} mins
                    </p>

                    <p className="font-bold text-red-600">
                      {c.escalationStage}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => resolveComplaint(c.id)}
                    disabled={resolvingId === c.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold w-full md:w-auto"
                  >
                    {resolvingId === c.id
                      ? "Resolving..."
                      : "Mark Resolved"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}