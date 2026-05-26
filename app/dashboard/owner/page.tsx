"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Complaint = {
  id: number
  complaintId: string
  washroomName: string
  floor: string
  cleanlinessStatus: string
  facilitiesWorking: boolean
  issueDescription: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
  resolvedByName: string
  resolutionTime: string
}

type DashboardData = {
  totalComplaints: number
  negativeComplaints: number
  openComplaints: number
  resolvedComplaints: number
  positiveFeedbackCount: number
  escalatedToGM: number
  escalatedToDirector: number
  avgResolutionMinutes: number
  recentComplaints: Complaint[]
  washrooms: {
    id: number
    name: string
  }[]
}

export default function OwnerDashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [singleDate, setSingleDate] =
    useState("")

  const [fromDate, setFromDate] =
    useState("")

  const [toDate, setToDate] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("")

  const [washroomFilter, setWashroomFilter] =
    useState("")

  function formatMinutes(minutes: number) {
    if (!minutes) return "0 mins"

    if (minutes < 60) {
      return `${minutes} mins`
    }

    const hrs = Math.floor(minutes / 60)
    const remaining = minutes % 60

    if (remaining === 0) {
      return `${hrs} hr`
    }

    return `${hrs} hr ${remaining} mins`
  }

  async function fetchDashboard(
    customDate?: string,
    customFrom?: string,
    customTo?: string,
    customStatus?: string,
    customWashroom?: string
  ) {
    try {
      setLoading(true)

      let url =
        "/api/dashboard/owner"

      const params =
        new URLSearchParams()

      if (customDate) {
        params.append(
          "date",
          customDate
        )
      }

      if (
        customFrom &&
        customTo
      ) {
        params.append(
          "from",
          customFrom
        )

        params.append(
          "to",
          customTo
        )
      }

      if (customStatus) {
        params.append(
          "status",
          customStatus
        )
      }

      if (customWashroom) {
        params.append(
          "washroom",
          customWashroom
        )
      }

      if (
        params.toString()
      ) {
        url +=
          "?" +
          params.toString()
      }

      const res =
        await fetch(url)

      if (!res.ok) {
        throw new Error(
          "API failed"
        )
      }

      const json =
        await res.json()

      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  function applySingleDateFilter() {
    if (!singleDate) return

    fetchDashboard(
      singleDate,
      fromDate,
      toDate,
      statusFilter,
      washroomFilter
    )
  }

  function applyRangeFilter() {
    if (!fromDate || !toDate)
      return

    fetchDashboard(
      singleDate,
      fromDate,
      toDate,
      statusFilter,
      washroomFilter
    )
  }

  function applyStatusFilter(
    value: string
  ) {
    setStatusFilter(value)

    fetchDashboard(
      singleDate,
      fromDate,
      toDate,
      value,
      washroomFilter
    )
  }

  function applyWashroomFilter(
    value: string
  ) {
    setWashroomFilter(value)

    fetchDashboard(
      singleDate,
      fromDate,
      toDate,
      statusFilter,
      value
    )
  }

  function clearFilters() {
    setSingleDate("")
    setFromDate("")
    setToDate("")
    setStatusFilter("")
    setWashroomFilter("")

    fetchDashboard()
  }
    function exportExcel() {
    if (!data) return

    const exportData =
      data.recentComplaints.map((item) => ({
        ComplaintID:
          item.complaintId,
        Washroom:
          item.washroomName,
        Floor: item.floor,
        Cleanliness:
          item.cleanlinessStatus,
        Facilities:
          item.facilitiesWorking
            ? "Yes"
            : "No",
        Issue:
          item.issueDescription ||
          "-",
        Status: item.status,
        Created: new Date(
          item.createdAt
        ).toLocaleString(),
        Resolved:
          item.resolvedAt
            ? new Date(
                item.resolvedAt
              ).toLocaleString()
            : "-",
        ResolvedBy:
          item.resolvedByName ||
          "-",
        ResolutionTime:
          item.resolutionTime ||
          "-",
      }))

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Complaints"
    )

    XLSX.writeFile(
      workbook,
      "owner-dashboard-report.xlsx"
    )
  }

  function exportPDF() {
    if (!data) return

    const doc = new jsPDF({
      orientation:
        "landscape",
      unit: "mm",
      format: "a4",
    })

    const generatedAt =
      new Date().toLocaleString()

    let reportRange =
      "All Data"

    if (singleDate) {
      reportRange = `Single Date: ${singleDate}`
    }

    if (
      fromDate &&
      toDate
    ) {
      reportRange = `From ${fromDate} To ${toDate}`
    }

    doc.setFontSize(20)

    doc.text(
      "South Avenue Mall Washroom Monitoring System",
      14,
      15
    )

    doc.setFontSize(16)

    doc.text(
      "Owner Dashboard Complaint Report",
      14,
      25
    )

    doc.setFontSize(10)

    doc.text(
      `Generated On: ${generatedAt}`,
      14,
      35
    )

    doc.text(
      `Report Period: ${reportRange}`,
      14,
      42
    )

    doc.text(
      `Generated By: Owner Dashboard`,
      14,
      49
    )

    doc.text(
      `Total Complaints: ${data.totalComplaints}`,
      190,
      30
    )

    doc.text(
      `Negative Complaints: ${data.negativeComplaints}`,
      190,
      37
    )

    doc.text(
      `Positive Feedback: ${data.positiveFeedbackCount}`,
      190,
      44
    )

    doc.text(
      `Resolved Complaints: ${data.resolvedComplaints}`,
      190,
      51
    )

    doc.text(
      `Escalated to GM: ${data.escalatedToGM}`,
      190,
      58
    )

    doc.text(
      `Critical Escalations: ${data.escalatedToDirector}`,
      190,
      65
    )

    doc.text(
      `Avg Resolution: ${formatMinutes(
        data.avgResolutionMinutes
      )}`,
      190,
      72
    )

    autoTable(doc, {
      startY: 88,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [
          15, 23, 42,
        ],
        textColor: 255,
      },
      head: [[
        "Complaint ID",
        "Washroom",
        "Floor",
        "Cleanliness",
        "Facilities",
        "Issue",
        "Status",
        "Created",
        "Resolved",
        "Resolved By",
        "Resolution Time",
      ]],
      body:
        data.recentComplaints.map(
          (item) => [
            item.complaintId,
            item.washroomName,
            item.floor,
            item.cleanlinessStatus,
            item.facilitiesWorking
              ? "Yes"
              : "No",
            item.issueDescription ||
              "No action needed",
            item.status,
            new Date(
              item.createdAt
            ).toLocaleString(),
            item.resolvedAt
              ? new Date(
                  item.resolvedAt
                ).toLocaleString()
              : "-",
            item.resolvedByName ||
              "-",
            item.resolutionTime ||
              "-",
          ]
        ),
    })

    doc.save(
      `owner-report-${Date.now()}.pdf`
    )
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-10 text-red-600">
        Failed to load dashboard
      </div>
    )
  }
    return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b shadow-sm px-4 md:px-10 py-4 md:py-6 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
          <img
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            className="h-10 md:h-14 w-auto"
          />

          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
              Owner Dashboard
            </h1>

            <p className="text-slate-600 text-sm md:text-xl">
              South Avenue Mall Washroom Monitoring System
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
          <span className="text-base md:text-xl">
            Welcome, Mall Owner
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
                applySingleDateFilter
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
                applyRangeFilter
              }
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold mt-8"
            >
              Apply Range
            </button>

            <button
              onClick={clearFilters}
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
                value={statusFilter}
                onChange={(e) =>
                  applyStatusFilter(
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
                value={washroomFilter}
                onChange={(e) =>
                  applyWashroomFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-xl w-full"
              >
                <option value="">
                  All Washrooms
                </option>

                {data.washrooms.map(
                  (w) => (
                    <option
                      key={w.id}
                      value={w.name}
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
              onClick={exportExcel}
              className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold"
            >
              Export Excel
            </button>

            <button
              onClick={exportPDF}
              className="bg-red-600 text-white px-6 py-4 rounded-2xl font-bold"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-10">
          <div className="bg-pink-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Total Complaints
            </h2>

            <p className="text-4xl font-bold mt-4">
              {data.totalComplaints}
            </p>

            <p className="mt-3 text-sm">
              Negative:{" "}
              {
                data.negativeComplaints
              }
            </p>

            <p className="text-sm">
              Positive:{" "}
              {
                data.positiveFeedbackCount
              }
            </p>
          </div>

          <div className="bg-yellow-500 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Open
            </h2>

            <p className="text-4xl font-bold mt-4">
              {
                data.openComplaints
              }
            </p>
          </div>

          <div className="bg-green-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Resolved
            </h2>

            <p className="text-4xl font-bold mt-4">
              {
                data.resolvedComplaints
              }
            </p>
          </div>

          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Escalated GM
            </h2>

            <p className="text-4xl font-bold mt-4">
              {
                data.escalatedToGM
              }
            </p>
          </div>

          <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Critical
            </h2>

            <p className="text-4xl font-bold mt-4">
              {
                data.escalatedToDirector
              }
            </p>
          </div>

          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Positive
            </h2>

            <p className="text-4xl font-bold mt-4">
              {
                data.positiveFeedbackCount
              }
            </p>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold">
              Avg Resolution
            </h2>

            <p className="text-2xl font-bold mt-4">
              {formatMinutes(
                data.avgResolutionMinutes
              )}
            </p>
          </div>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold mb-8">
          Customer Complaints
        </h2>
                <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-slate-900 text-white">
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
                  Resolved By
                </th>

                <th className="p-4 text-left">
                  Resolution Time
                </th>
              </tr>
            </thead>

            <tbody>
              {data.recentComplaints.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-b"
                  >
                    <td className="p-4">
                      {
                        item.complaintId
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.washroomName
                      }
                    </td>

                    <td className="p-4">
                      {
                        item.cleanlinessStatus
                      }
                    </td>

                    <td className="p-4">
                      {item.facilitiesWorking
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="p-4">
                      {item.issueDescription ||
                        "-"}
                    </td>

                    <td className="p-4">
                      {item.status}
                    </td>

                    <td className="p-4">
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {item.resolvedAt
                        ? new Date(
                            item.resolvedAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="p-4">
                      {item.resolvedByName ||
                        "-"}
                    </td>

                    <td className="p-4">
                      {item.resolutionTime ||
                        "-"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}