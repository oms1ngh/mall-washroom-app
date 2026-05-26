"use client"

import {
  useEffect,
  useState,
} from "react"

import { signOut } from "next-auth/react"
import Image from "next/image"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Complaint = {
  id: number
  complaintId: string
  washroomName: string
  cleanlinessStatus: string
  facilitiesWorking: boolean
  issueDescription: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
  resolutionTime: string
  escalationStage?: string
  timeLeft?: string
  resolvedBy?: {
    name: string
  } | null
}

type DashboardResponse = {
  liveComplaints: Complaint[]
  escalatedComplaints: Complaint[]
  reportComplaints: Complaint[]

  stats: {
    totalComplaints: number
    negativeComplaints: number
    positiveFeedbackCount: number
    openComplaints: number
    resolvedComplaints: number
    escalatedCount: number
    criticalCount: number
    avgResolutionMinutes: number
  }

  washrooms: {
    id: number
    name: string
  }[]
}

function formatMinutes(
  mins: number
) {
  if (!mins) return "0 mins"

  if (mins < 60) {
    return `${mins} mins`
  }

  const hrs = Math.floor(mins / 60)
  const remaining = mins % 60

  if (remaining === 0) {
    return `${hrs} hr`
  }

  return `${hrs} hr ${remaining} mins`
}

export default function GMDashboard() {
  const [activeTab, setActiveTab] =
    useState("live")

  const [liveComplaints, setLiveComplaints] =
    useState<Complaint[]>([])

  const [
    escalatedComplaints,
    setEscalatedComplaints,
  ] = useState<Complaint[]>([])

  const [
    reportComplaints,
    setReportComplaints,
  ] = useState<Complaint[]>([])

  const [washrooms, setWashrooms] =
    useState<
      {
        id: number
        name: string
      }[]
    >([])

  const [stats, setStats] =
    useState({
      totalComplaints: 0,
      negativeComplaints: 0,
      positiveFeedbackCount: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      escalatedCount: 0,
      criticalCount: 0,
      avgResolutionMinutes: 0,
    })

  const [singleDate, setSingleDate] =
    useState("")

  const [fromDate, setFromDate] =
    useState("")

  const [toDate, setToDate] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("")

  const [
    washroomFilter,
    setWashroomFilter,
  ] = useState("")

  async function fetchDashboard() {
    const params =
      new URLSearchParams()

    if (singleDate) {
      params.append(
        "date",
        singleDate
      )
    }

    if (fromDate && toDate) {
      params.append(
        "from",
        fromDate
      )

      params.append("to", toDate)
    }

    if (statusFilter) {
      params.append(
        "status",
        statusFilter
      )
    }

    if (washroomFilter) {
      params.append(
        "washroom",
        washroomFilter
      )
    }

    const res = await fetch(
      `/api/dashboard/gm?${params.toString()}`
    )

    if (!res.ok) {
      throw new Error(
        "Dashboard API failed"
      )
    }

    const data: DashboardResponse =
      await res.json()

    setLiveComplaints(
      data.liveComplaints
    )

    setEscalatedComplaints(
      data.escalatedComplaints
    )

    setReportComplaints(
      data.reportComplaints
    )

    setStats(data.stats)
    setWashrooms(data.washrooms)
  }

  function clearFilters() {
  setSingleDate("")
  setFromDate("")
  setToDate("")
  setStatusFilter("")
  setWashroomFilter("")

  setTimeout(() => {
    fetchDashboard()
  }, 100)
}

  function exportExcel() {
    const worksheet =
      XLSX.utils.json_to_sheet(
        reportComplaints.map((c) => ({
          ComplaintID:
            c.complaintId,
          Washroom:
            c.washroomName,
          Cleanliness:
            c.cleanlinessStatus,
          Facilities:
            c.facilitiesWorking
              ? "Yes"
              : "No",
          Issue:
            c.issueDescription ||
            "No comment",
          Status: c.status,
          Created:
            new Date(
              c.createdAt
            ).toLocaleString(),
          Resolved:
            c.resolvedAt
              ? new Date(
                  c.resolvedAt
                ).toLocaleString()
              : "-",
          ResolutionTime:
            c.resolutionTime,
          ResolvedBy:
            c.resolvedBy?.name ||
            "-",
        }))
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "GM Report"
    )

    XLSX.writeFile(
      workbook,
      "gm-report.xlsx"
    )
  }

  function exportPDF() {
    const doc = new jsPDF()

    autoTable(doc, {
      head: [
        [
          "Complaint",
          "Washroom",
          "Issue",
          "Status",
          "Created",
          "Resolved",
          "Time",
        ],
      ],

      body:
        reportComplaints.map((c) => [
          c.complaintId,
          c.washroomName,
          c.issueDescription ||
            "No comment",
          c.status,
          new Date(
            c.createdAt
          ).toLocaleString(),
          c.resolvedAt
            ? new Date(
                c.resolvedAt
              ).toLocaleString()
            : "-",
          c.resolutionTime,
        ]),
    })

    doc.save("gm-report.pdf")
  }

  useEffect(() => {
  fetchDashboard()
}, [
  singleDate,
  fromDate,
  toDate,
  statusFilter,
  washroomFilter,
])
    return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm px-4 md:px-10 py-4 md:py-6 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <Image
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            width={120}
            height={60}
            className="h-10 md:h-14 w-auto"
          />

          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
              GM Dashboard
            </h1>

            <p className="text-slate-600 text-sm md:text-xl">
              South Avenue Mall Washroom Monitoring System
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
          <span className="text-base md:text-xl">
            Welcome, General Manager
          </span>

          <button
            onClick={() =>
              signOut({
                callbackUrl:
                  "/login",
              })
            }
            className="bg-pink-600 text-white px-6 md:px-8 py-3 rounded-2xl font-bold w-full md:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 md:p-10">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Filter Complaints
          </h2>

          <div className="grid md:grid-cols-6 gap-4">
            <div>
              <label className="block mb-2 font-semibold">
                Single Date
              </label>

              <input
                type="date"
                value={singleDate}
                onChange={(e) =>
                  setSingleDate(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              />
            </div>

            <button
              onClick={
                fetchDashboard
              }
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold mt-8"
            >
              Apply Date
            </button>

            <div>
              <label className="block mb-2 font-semibold">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              />
            </div>

            <button
              onClick={
                fetchDashboard
              }
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold mt-8"
            >
              Apply Range
            </button>

            <button
              onClick={
                clearFilters
              }
              className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold mt-8"
            >
              Clear
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block mb-2 font-semibold">
                Status
              </label>

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              >
                <option value="">
                  All Status
                </option>
                <option value="OPEN">
                  Open
                </option>
                <option value="RESOLVED">
                  Resolved
                </option>
                <option value="ESCALATED_TO_GM">
                  Escalated
                </option>
                <option value="CRITICAL">
                  Critical
                </option>
                <option value="POSITIVE_FEEDBACK">
                  Positive Feedback
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Washroom
              </label>

              <select
                value={
                  washroomFilter
                }
                onChange={(e) =>
                  setWashroomFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              >
                <option value="">
                  All Washrooms
                </option>

                {washrooms.map(
                  (w) => (
                    <option
                      key={w.id}
                      value={
                        w.name
                      }
                    >
                      {w.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <button
              onClick={
                exportExcel
              }
              className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold"
            >
              Export Excel
            </button>

            <button
              onClick={
                exportPDF
              }
              className="bg-red-600 text-white px-6 py-4 rounded-2xl font-bold"
            >
              Export PDF
            </button>
          </div>
        </div>
                <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() =>
              setActiveTab("live")
            }
            className={`px-6 py-3 rounded-2xl font-bold ${
              activeTab === "live"
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            Live Monitoring
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "escalated"
              )
            }
            className={`px-6 py-3 rounded-2xl font-bold ${
              activeTab ===
              "escalated"
                ? "bg-orange-600 text-white"
                : "bg-white border"
            }`}
          >
            Escalated
          </button>

          <button
            onClick={() =>
              setActiveTab("report")
            }
            className={`px-6 py-3 rounded-2xl font-bold ${
              activeTab === "report"
                ? "bg-purple-600 text-white"
                : "bg-white border"
            }`}
          >
            Reports
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg">
              Total Complaints
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {
                stats.totalComplaints
              }
            </h3>

            <p className="mt-3 text-sm">
              Negative:{" "}
              {
                stats.negativeComplaints
              }
            </p>

            <p className="text-sm">
              Positive:{" "}
              {
                stats.positiveFeedbackCount
              }
            </p>
          </div>

          <div className="bg-green-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg">
              Resolved
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {
                stats.resolvedComplaints
              }
            </h3>
          </div>

          <div className="bg-orange-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg">
              Escalated to GM
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {
                stats.escalatedCount
              }
            </h3>
          </div>

          <div className="bg-red-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg">
              Critical
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {
                stats.criticalCount
              }
            </h3>
          </div>

          <div className="bg-purple-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-lg">
              Avg Resolution
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {formatMinutes(
                stats.avgResolutionMinutes
              )}
            </h3>
          </div>
        </div>

        {activeTab ===
          "live" && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-200">
  <tr>
    <th className="p-4 text-left">
      Complaint ID
    </th>

    <th className="p-4 text-left">
      Washroom
    </th>

    <th className="p-4 text-left">
      Issue
    </th>

    <th className="p-4 text-left">
      Status
    </th>

    <th className="p-4 text-left">
      Created
    </th>

    <th className="p-4 text-left">
      Resolution Time
    </th>
  </tr>
</thead>

                <tbody>
                  {liveComplaints.map(
                    (c) => (
                      <tr
                        key={c.id}
                        className="border-t"
                      >
                        <td className="p-4">
                          {
                            c.complaintId
                          }
                        </td>

                        <td className="p-4">
                          {
                            c.washroomName
                          }
                        </td>

                        <td className="p-4">
                          {c.issueDescription ||
                            "No comment"}
                        </td>

                        <td className="p-4">
                          {c.status}
                        </td>

                        <td className="p-4">
                          {new Date(
                          c.createdAt
                          ).toLocaleString()}
                        </td>

                        <td className="p-4">
                          {
                            c.escalationStage
                          }
                        </td>

                        <td className="p-4">
                          {c.timeLeft}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab ===
          "escalated" && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4 text-left">
                      Complaint ID
                    </th>
                    <th className="p-4 text-left">
                      Washroom
                    </th>
                    <th className="p-4 text-left">
                      Issue
                    </th>
                    <th className="p-4 text-left">
                      Status
                    </th>
                    <th className="p-4 text-left">
                      Resolution
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {escalatedComplaints.map(
                    (c) => (
                      <tr
                        key={c.id}
                        className="border-t"
                      >
                        <td className="p-4">
                          {
                            c.complaintId
                          }
                        </td>

                        <td className="p-4">
                          {
                            c.washroomName
                          }
                        </td>

                        <td className="p-4">
                          {c.issueDescription ||
                            "No comment"}
                        </td>

                        <td className="p-4">
                          {c.status}
                        </td>
                        
                        <td className="p-4">
  {new Date(
    c.createdAt
  ).toLocaleString()}
</td>

                        <td className="p-4">
                          {
                            c.resolutionTime
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
                {activeTab ===
          "report" && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4 text-left">
                      Complaint ID
                    </th>
                    <th className="p-4 text-left">
                      Washroom
                    </th>
                    <th className="p-4 text-left">
                      Cleanliness
                    </th>
                    <th className="p-4 text-left">
                      Facilities
                    </th>
                    <th className="p-4 text-left">
                      Issue
                    </th>
                    <th className="p-4 text-left">
                      Status
                    </th>
                    <th className="p-4 text-left">
                      Created
                    </th>
                    <th className="p-4 text-left">
                      Resolved
                    </th>
                    <th className="p-4 text-left">
                      Resolution Time
                    </th>
                    <th className="p-4 text-left">
                      Resolved By
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reportComplaints.map(
                    (c) => (
                      <tr
                        key={c.id}
                        className="border-t"
                      >
                        <td className="p-4">
                          {
                            c.complaintId
                          }
                        </td>

                        <td className="p-4">
                          {
                            c.washroomName
                          }
                        </td>

                        <td className="p-4">
                          {
                            c.cleanlinessStatus
                          }
                        </td>

                        <td className="p-4">
                          {c.facilitiesWorking
                            ? "Yes"
                            : "No"}
                        </td>

                        <td className="p-4">
                          {c.issueDescription?.trim()
                            ? c.issueDescription
                            : c.status ===
                              "POSITIVE_FEEDBACK"
                            ? "Positive feedback"
                            : "No comment"}
                        </td>

                        <td className="p-4">
                          {c.status}
                        </td>

                        <td className="p-4">
                          {new Date(
                            c.createdAt
                          ).toLocaleString()}
                        </td>

                        <td className="p-4">
                          {c.resolvedAt
                            ? new Date(
                                c.resolvedAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td className="p-4">
                          {
                            c.resolutionTime
                          }
                        </td>

                        <td className="p-4">
                          {c.resolvedBy
                            ?.name || "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}