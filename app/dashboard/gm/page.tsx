"use client"

import {
  useEffect,
  useState,
} from "react"
import { signOut } from "next-auth/react"
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


type DashboardData = {
  liveComplaints:
    Complaint[]

  escalatedComplaints:
    Complaint[]

  reportComplaints:
    Complaint[]

  washrooms: {
    id: number
    name: string
  }[]

  stats: {
    totalComplaints:
      number

    negativeComplaints:
      number

    positiveFeedbackCount:
      number

    openComplaints:
      number

    resolvedComplaints:
      number

    escalatedCount:
      number

    criticalCount:
      number

    avgResolutionMinutes:
      number
  }
}



function formatAvgTime(
  mins: number
) {
  if (!mins) return "0 mins"

  if (mins < 60) {
    return `${mins} mins`
  }

  const hrs = Math.floor(
    mins / 60
  )
  const rem = mins % 60

  if (rem === 0) {
    return `${hrs} hr`
  }

  return `${hrs} hr ${rem} mins`
}

export default function GMDashboard() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    )

  const [activeTab, setActiveTab] =
    useState<
      "live" | "escalated" | "report"
    >("live")

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
    let url =
      "/api/dashboard/gm"

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

    if (params.toString()) {
      url +=
        "?" + params.toString()
    }

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(
        "Dashboard API failed"
      )
    }

    const json = await res.json()
    setData(json)
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

  function clearFilters() {
    setSingleDate("")
    setFromDate("")
    setToDate("")
    setStatusFilter("")
    setWashroomFilter("")
  }

  function exportExcel() {
    if (!data) return

    const rows =
      data.reportComplaints.map(
        (c) => ({
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
          Resolved: c.resolvedAt
            ? new Date(
                c.resolvedAt
              ).toLocaleString()
            : "-",
          ResolutionTime:
            c.resolutionTime,
          ResolvedBy:
            c.resolvedBy?.name ||
            "-",
        })
      )

    const ws =
      XLSX.utils.json_to_sheet(
        rows
      )

    const wb =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "GM Report"
    )

    XLSX.writeFile(
      wb,
      "gm-report.xlsx"
    )
  }

  function exportPDF() {
    if (!data) return

    const doc = new jsPDF()

    doc.text(
      "GM Dashboard Report",
      14,
      15
    )

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Complaint ID",
          "Washroom",
          "Issue",
          "Status",
          "Created",
          "Resolved",
          "Resolution",
        ],
      ],
      body:
        data.reportComplaints.map(
          (c) => [
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
          ]
        ),
    })

    doc.save("gm-report.pdf")
  }

  if (!data) {
    return (
      <div className="p-10">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            GM Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            South Avenue Mall
          </p>
        </div>

        <button
          onClick={() =>
            signOut()
          }
          className="bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <main className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-5">
            Filters
          </h2>

          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="date"
              value={singleDate}
              onChange={(e) =>
                setSingleDate(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3"
            />

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3"
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

            <select
              value={
                washroomFilter
              }
              onChange={(e) =>
                setWashroomFilter(
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-3"
            >
              <option value="">
                All Washrooms
              </option>

              {data.washrooms.map(
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

          <div className="flex gap-4 mt-5">
            <button
              onClick={
                clearFilters
              }
              className="bg-gray-600 text-white px-5 py-2 rounded-lg"
            >
              Clear Filters
            </button>

            <button
              onClick={
                exportExcel
              }
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Export Excel
            </button>

            <button
              onClick={
                exportPDF
              }
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">
            <p>Total Complaints</p>
            <h3 className="text-3xl font-bold mt-2">
              {
                data.stats.totalComplaints
              }
            </h3>
            <p className="text-sm mt-2">
              Negative:{" "}
              {
                data.stats.negativeComplaints
              }
            </p>
            <p className="text-sm">
              Positive:{" "}
              {
                data.stats.positiveFeedbackCount
              }
            </p>
          </div>

          <div className="bg-green-600 text-white rounded-2xl p-6 shadow">
            <p>Resolved</p>
            <h3 className="text-3xl font-bold mt-2">
              {
                data.stats.resolvedComplaints
              }
            </h3>
          </div>

          <div className="bg-orange-600 text-white rounded-2xl p-6 shadow">
            <p>Escalated</p>
            <h3 className="text-3xl font-bold mt-2">
              {
                data.stats.escalatedCount
              }
            </h3>
          </div>

          <div className="bg-red-600 text-white rounded-2xl p-6 shadow">
            <p>Critical</p>
            <h3 className="text-3xl font-bold mt-2">
              {
                data.stats.criticalCount
              }
            </h3>
          </div>

          <div className="bg-purple-600 text-white rounded-2xl p-6 shadow">
            <p>Avg Resolution</p>
            <h3 className="text-2xl font-bold mt-2">
              {formatAvgTime(
                data.stats.avgResolutionMinutes
              )}
            </h3>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() =>
              setActiveTab("live")
            }
            className={`px-5 py-2 rounded-lg ${
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
            className={`px-5 py-2 rounded-lg ${
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
            className={`px-5 py-2 rounded-lg ${
              activeTab === "report"
                ? "bg-purple-600 text-white"
                : "bg-white border"
            }`}
          >
            Reports
          </button>
        </div>
                {activeTab === "live" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                      Escalation
                    </th>
                    <th className="p-4 text-left">
                      Time Left
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.liveComplaints.map(
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
          <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                  {data.escalatedComplaints.map(
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

              {activeTab === "report" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                  {data.reportComplaints.map(
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