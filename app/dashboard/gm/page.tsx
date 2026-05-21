"use client"

import { useEffect, useMemo, useState } from "react"
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
  timeLeft: string
  status: string
  createdAt: string
  resolvedAt: string | null
  resolutionTime: string
  resolvedBy?: {
    name: string
    role: string
  } | null
}

type Washroom = {
  id: number
  name: string
}

export default function GMDashboard() {
  const [activeTab, setActiveTab] = useState("live")
  const [liveComplaints, setLiveComplaints] = useState<Complaint[]>([])
  const [escalatedComplaints, setEscalatedComplaints] = useState<Complaint[]>([])
  const [reportComplaints, setReportComplaints] = useState<Complaint[]>([])
  const [washrooms, setWashrooms] = useState<Washroom[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [singleDate, setSingleDate] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [washroomFilter, setWashroomFilter] = useState("")

  async function loadData() {
    try {
      const res = await fetch("/api/dashboard/gm")
      const data = await res.json()

      setLiveComplaints(data.liveComplaints || [])
      setEscalatedComplaints(data.escalatedComplaints || [])
      setReportComplaints(data.reportComplaints || [])
      setWashrooms(data.washrooms || [])
      setStats(data.stats)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const filteredReports = useMemo(() => {
    return reportComplaints.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false
      if (washroomFilter && c.washroomName !== washroomFilter) return false

      if (singleDate) {
        const d = new Date(c.createdAt).toDateString()
        const selected = new Date(singleDate).toDateString()
        if (d !== selected) return false
      }

      if (fromDate && toDate) {
        const created = new Date(c.createdAt).getTime()
        const from = new Date(fromDate).getTime()
        const to = new Date(toDate).getTime()

        if (created < from || created > to + 86400000) {
          return false
        }
      }

      return true
    })
  }, [
    reportComplaints,
    statusFilter,
    washroomFilter,
    singleDate,
    fromDate,
    toDate,
  ])

  function clearFilters() {
    setSingleDate("")
    setFromDate("")
    setToDate("")
    setStatusFilter("")
    setWashroomFilter("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
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
                General Manager Dashboard
              </h1>

              <p className="text-slate-600">
                South Avenue Mall Washroom Monitoring System
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-6 py-3 rounded-xl font-semibold ${
              activeTab === "live" ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
          >
            Live Monitoring
          </button>

          <button
            onClick={() => setActiveTab("escalated")}
            className={`px-6 py-3 rounded-xl font-semibold ${
              activeTab === "escalated" ? "bg-red-600 text-white" : "bg-white shadow"
            }`}
          >
            Escalated
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 rounded-xl font-semibold ${
              activeTab === "reports" ? "bg-green-600 text-white" : "bg-white shadow"
            }`}
          >
            Reports
          </button>
        </div>

        {/* LIVE MONITORING */}
        {activeTab === "live" && (
          <div className="grid gap-6">
            {liveComplaints.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow p-6">
                <p>
                  <strong>ID:</strong> {c.complaintId}
                </p>
                <p>
                  <strong>Washroom:</strong> {c.washroomName}
                </p>
                <p>
                  <strong>Status:</strong> {c.status}
                </p>
                <p>
                  <strong>Issue:</strong> {c.issueDescription || "No comment"}
                </p>

                {c.status === "RESOLVED" ? (
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Complaint Received:</strong>{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>

                    <p>
                      <strong>Resolved At:</strong>{" "}
                      {c.resolvedAt
                        ? new Date(c.resolvedAt).toLocaleString()
                        : "-"}
                    </p>

                    <p>
                      <strong>Resolved By:</strong> {c.resolvedBy?.name || "-"}
                    </p>

                    <p className="text-green-600 font-semibold">
                      Resolution Time: {c.resolutionTime}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="text-orange-600 font-semibold">
                      Complaint Age: {c.complaintAgeMinutes} mins
                    </p>

                    <p className="text-blue-700 font-semibold">{c.timeLeft}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ESCALATED */}
        {activeTab === "escalated" && (
          <div className="grid gap-6">
            {escalatedComplaints.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow p-6">
                <p>
                  <strong>ID:</strong> {c.complaintId}
                </p>
                <p>
                  <strong>Washroom:</strong> {c.washroomName}
                </p>
                <p>
                  <strong>Status:</strong> {c.status}
                </p>
                <p>
                  <strong>Issue:</strong> {c.issueDescription || "No comment"}
                </p>

                <p className="text-red-600 font-bold">
                  {c.complaintAgeMinutes >= 30
                    ? "Escalated to Owner (30 mins exceeded)"
                    : "Escalated to GM — supervisor action overdue"}
                </p>

                <p className="text-blue-700 font-semibold">
                  {c.complaintAgeMinutes >= 30
                    ? "Immediate owner attention required"
                    : c.timeLeft}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === "reports" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-pink-600 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">{stats.totalComplaints}</div>
                <div>Total</div>
              </div>

              <div className="bg-yellow-500 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">{stats.openComplaints}</div>
                <div>Open</div>
              </div>

              <div className="bg-green-600 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">{stats.resolvedComplaints}</div>
                <div>Resolved</div>
              </div>

              <div className="bg-orange-500 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">{stats.escalatedCount}</div>
                <div>Escalated</div>
              </div>

              <div className="bg-red-600 text-white p-6 rounded-2xl">
                <div className="text-3xl font-bold">{stats.criticalCount}</div>
                <div>Critical</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mb-6">
  <div className="flex flex-wrap gap-6 items-end">
    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-2">
        Single Date
      </label>
      <input
        type="date"
        value={singleDate}
        onChange={(e) => setSingleDate(e.target.value)}
        className="border p-3 rounded-xl"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-2">
        From Date
      </label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="border p-3 rounded-xl"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-2">
        To Date
      </label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="border p-3 rounded-xl"
      />
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-2">
        Status
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border p-3 rounded-xl"
      >
        <option value="">All Status</option>
        <option value="OPEN">OPEN</option>
        <option value="RESOLVED">RESOLVED</option>
        <option value="ESCALATED_TO_GM">ESCALATED</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>
    </div>

    <div className="flex flex-col">
      <label className="text-sm font-semibold mb-2">
        Washroom
      </label>
      <select
        value={washroomFilter}
        onChange={(e) => setWashroomFilter(e.target.value)}
        className="border p-3 rounded-xl"
      >
        <option value="">All Washrooms</option>

        {washrooms.map((w) => (
          <option key={w.id} value={w.name}>
            {w.name}
          </option>
        ))}
      </select>
    </div>

    <button
      onClick={clearFilters}
      className="bg-gray-600 text-white px-6 py-3 rounded-xl"
    >
      Clear
    </button>
  </div>
</div>

<div className="bg-white rounded-2xl shadow overflow-auto">
  <table className="w-full min-w-[1500px]">
    <thead className="bg-slate-900 text-white">
      <tr>
        <th className="p-4 text-left">Complaint</th>
        <th className="p-4 text-left">Washroom</th>
        <th className="p-4 text-left">Status</th>
        <th className="p-4 text-left">Issue</th>
        <th className="p-4 text-left">Created</th>
        <th className="p-4 text-left">Resolved</th>
        <th className="p-4 text-left">Resolved By</th>
        <th className="p-4 text-left">Resolution Time</th>
      </tr>
    </thead>

    <tbody>
      {filteredReports.map((c) => (
        <tr key={c.id} className="border-b">
          <td className="p-4">{c.complaintId}</td>
          <td className="p-4">{c.washroomName}</td>
          <td className="p-4">{c.status}</td>
          <td className="p-4">{c.issueDescription || "-"}</td>
          <td className="p-4">
            {new Date(c.createdAt).toLocaleString()}
          </td>
          <td className="p-4">
            {c.resolvedAt
              ? new Date(c.resolvedAt).toLocaleString()
              : "-"}
          </td>
          <td className="p-4">{c.resolvedBy?.name || "-"}</td>
          <td className="p-4">{c.resolutionTime}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
          </>
        )}
      </div>
    </div>
  )
}