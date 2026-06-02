"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import DashboardCard from "@/components/DashboardCard"

type User = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  isActive?: boolean
}

type AssignmentRow = {
  id: number

  supervisor: {
    id: number
    name: string
    email?: string
    phone?: string
  }

  generalManager: {
    id: number
    name: string
    email?: string
    phone?: string
  }

  supervisorExtraEmails: string
  supervisorExtraPhones: string

  gmExtraEmails: string
  gmExtraPhones: string

  ownerEmails: string
  ownerPhones: string
}

type Assignment = {
  washroom: {
    id: number
    name: string
    code?: string
    floor?: string
  }

  assignments: AssignmentRow[]
}


type Washroom = {
  id: number
  name: string
  code: string
  floor: string
  active: boolean
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] =
    useState<Assignment[]>([])
  const [washrooms, setWashrooms] = useState<Washroom[]>([])

  const [editingUserId, setEditingUserId] =
    useState<number | null>(null)

  const [editingWashroomId, setEditingWashroomId] =
    useState<number | null>(null)

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  })

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "SUPERVISOR",
  })

  const [washroomForm, setWashroomForm] = useState({
    name: "",
    code: "",
    floor: "",
  })

  const [editWashroomForm, setEditWashroomForm] =
    useState({
      name: "",
      code: "",
      floor: "",
      active: true,
    })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const usersRes = await fetch("/api/users")
    const usersData = await usersRes.json()
    setUsers(usersData)

    const assignRes = await fetch("/api/assignments")
    const assignData = await assignRes.json()
    setAssignments(assignData)

    const washroomRes = await fetch("/api/washrooms")
    const washroomData = await washroomRes.json()
    setWashrooms(washroomData)
  }

  function startEdit(user: User) {
    setEditingUserId(user.id)

    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
    })
  }
    async function createUser(e: React.FormEvent) {
    e.preventDefault()

    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "SUPERVISOR",
    })

    loadData()
  }

  async function saveEdit(userId: number) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Update failed")
      return
    }

    alert("User updated")

    setEditingUserId(null)
    loadData()
  }

  async function deleteUser(
    userId: number,
    email: string
  ) {
    if (email === "admin@southavenuemall.com") {
      alert("Admin cannot be deleted")
      return
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this user?"
    )

    if (!confirmDelete) return

    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Delete failed")
      return
    }

    loadData()
  }

  async function createWashroom(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const res = await fetch("/api/washrooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(washroomForm),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Create failed")
      return
    }

    alert("Washroom created")

    setWashroomForm({
      name: "",
      code: "",
      floor: "",
    })

    loadData()
  }

  function startWashroomEdit(
    washroom: Washroom
  ) {
    setEditingWashroomId(washroom.id)

    setEditWashroomForm({
      name: washroom.name,
      code: washroom.code,
      floor: washroom.floor,
      active: washroom.active,
    })
  }

  async function saveWashroomEdit(
    washroomId: number
  ) {
    const res = await fetch(
      `/api/washrooms/${washroomId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editWashroomForm),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Update failed")
      return
    }

    alert("Washroom updated")

    setEditingWashroomId(null)
    loadData()
  }

async function saveAssignment(
  assignmentGroup: Assignment,
  assignment: AssignmentRow
) {
  const res = await fetch(
    "/api/assignments",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
       
id:
  assignment.id > 1000000000
    ? null
    : assignment.id,



        washroomId:
          assignmentGroup.washroom.id,

        supervisorId:
          assignment.supervisor.id,

        generalManagerId:
          assignment.generalManager.id,

        supervisorExtraEmails:
          assignment.supervisorExtraEmails,

        supervisorExtraPhones:
          assignment.supervisorExtraPhones,

        gmExtraEmails:
          assignment.gmExtraEmails,

        gmExtraPhones:
          assignment.gmExtraPhones,

        ownerEmails:
          assignment.ownerEmails,

        ownerPhones:
          assignment.ownerPhones,
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    alert(
      data.error ||
        "Save failed"
    )

    return
  }

  alert("Assignment saved")

  loadData()
}

function addSupervisorRow(
  assignmentGroup: Assignment
) {
  const updated =
    assignments.map((group) => {

      if (
        group.washroom.id !==
        assignmentGroup.washroom.id
      ) {
        return group
      }

      const hasEmptyRow =
        group.assignments.some(
          (a) =>
            a.supervisor.id === 0
        )

      if (hasEmptyRow) {
        alert(
          "Finish current supervisor row first"
        )

        return group
      }

      return {
        ...group,

        assignments: [
          ...group.assignments,

          {
            id: Date.now(),

            supervisor: {
              id: 0,
              name: "",
            },

            generalManager: {
              id: 0,
              name: "",
            },

            supervisorExtraEmails:
              "",

            supervisorExtraPhones:
              "",

            gmExtraEmails: "",

            gmExtraPhones: "",

            ownerEmails: "",

            ownerPhones: "",
          },
        ],
      }
    })

  setAssignments(updated)
}


async function deleteAssignment(
  assignmentId: number
) {

  // TEMP UNSAVED ROW
  if (assignmentId > 1000000000) {

    const updated =
      assignments.map((group) => ({
        ...group,

        assignments:
          group.assignments.filter(
            (a) =>
              a.id !== assignmentId
          ),
      }))

    setAssignments(updated)

    return
  }

  const confirmDelete = confirm(
    "Delete this assignment?"
  )

  if (!confirmDelete) return

  const res = await fetch(
    "/api/assignments",
    {
      method: "DELETE",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        id: assignmentId,
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    alert(
      data.error ||
        "Delete failed"
    )

    return
  }

  alert("Assignment deleted")

  loadData()
}

async function deleteWashroom(
  washroomId: number
) {
  const confirmDelete = confirm(
    "Delete this washroom?"
  )

  if (!confirmDelete) return

  const res = await fetch(
    `/api/washrooms/${washroomId}`,
    {
      method: "DELETE",
    }
  )

  const data = await res.json()

  if (!res.ok) {
    alert(
      data.error ||
        "Delete failed"
    )

    return
  }

  alert("Washroom deleted")

  loadData()
}



  return (
    <div className="min-h-screen">
      <Navbar
        title="Super Admin Dashboard"
        userName="Administrator"
      />

      <div className="max-w-7xl mx-auto p-8">        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <DashboardCard
            title="Total Users"
            value={users.length}
            color="bg-pink-600"
          />

          <DashboardCard
            title="Total Assignments"
            value={assignments.length}
            color="bg-slate-700"
          />

          <DashboardCard
            title="Total Washrooms"
            value={washrooms.length}
            color="bg-purple-600"
          />

          <DashboardCard
            title="General Managers"
            value={
              users.filter(
                (u) =>
                  u.role === "GENERAL_MANAGER"
              ).length
            }
            color="bg-emerald-600"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Create New User
          </h2>

          <form
            onSubmit={createUser}
            className="grid md:grid-cols-5 gap-4"
          >
            <input
              placeholder="Name"
              className="border p-4 rounded-xl"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <input
              placeholder="Email"
              className="border p-4 rounded-xl"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <input
              placeholder="Phone"
              className="border p-4 rounded-xl"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="border p-4 rounded-xl"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

            <select
              className="border p-4 rounded-xl"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
            >
              <option value="SUPERVISOR">
                SUPERVISOR
              </option>
              <option value="GENERAL_MANAGER">
                GENERAL_MANAGER
              </option>
              <option value="OWNER">
                OWNER
              </option>
            </select>

            <button
              type="submit"
              className="md:col-span-5 bg-pink-600 text-white p-4 rounded-xl font-semibold"
            >
              Create User
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">
            Add New Washroom
          </h2>

          <form
            onSubmit={createWashroom}
            className="grid md:grid-cols-4 gap-4"
          >
            <input
              placeholder="Washroom Name"
              className="border p-4 rounded-xl"
              value={washroomForm.name}
              onChange={(e) =>
                setWashroomForm({
                  ...washroomForm,
                  name: e.target.value,
                })
              }
            />

            <input
              placeholder="Code"
              className="border p-4 rounded-xl"
              value={washroomForm.code}
              onChange={(e) =>
                setWashroomForm({
                  ...washroomForm,
                  code: e.target.value,
                })
              }
            />

            <input
              placeholder="Floor"
              className="border p-4 rounded-xl"
              value={washroomForm.floor}
              onChange={(e) =>
                setWashroomForm({
                  ...washroomForm,
                  floor: e.target.value,
                })
              }
            />

            <button
              type="submit"
              className="bg-purple-600 text-white rounded-xl font-semibold"
            >
              Add Washroom
            </button>
          </form>
        </div>        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            User Management
          </h2>

          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">New Password</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    {editingUserId === user.id ? (
                      <>
                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <input
                            type="password"
                            placeholder="Leave blank to keep same"
                            className="border p-2 rounded w-full"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                password: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <select
                            className="border p-2 rounded w-full"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value="SUPERVISOR">
                              SUPERVISOR
                            </option>
                            <option value="GENERAL_MANAGER">
                              GENERAL_MANAGER
                            </option>
                            <option value="OWNER">
                              OWNER
                            </option>
                            <option value="SUPER_ADMIN">
                              SUPER_ADMIN
                            </option>
                          </select>
                        </td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              saveEdit(user.id)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Save
                          </button>

                          <button
                            onClick={() =>
                              setEditingUserId(null)
                            }
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.phone}</td>
                        <td className="p-4">••••••••</td>
                        <td className="p-4">{user.role}</td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              startEdit(user)
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteUser(
                                user.id,
                                user.email
                              )
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            Washroom Management
          </h2>

          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Code</th>
                  <th className="p-4 text-left">Floor</th>
                  <th className="p-4 text-left">Active</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {washrooms.map((washroom) => (
                  <tr key={washroom.id} className="border-b">
                    {editingWashroomId === washroom.id ? (
                      <>
                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editWashroomForm.name}
                            onChange={(e) =>
                              setEditWashroomForm({
                                ...editWashroomForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editWashroomForm.code}
                            onChange={(e) =>
                              setEditWashroomForm({
                                ...editWashroomForm,
                                code: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full"
                            value={editWashroomForm.floor}
                            onChange={(e) =>
                              setEditWashroomForm({
                                ...editWashroomForm,
                                floor: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td className="p-4">
                          <select
                            value={
                              editWashroomForm.active
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              setEditWashroomForm({
                                ...editWashroomForm,
                                active:
                                  e.target.value === "true",
                              })
                            }
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              saveWashroomEdit(
                                washroom.id
                              )
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            Save
                          </button>

                          <button
                            onClick={() =>
                              setEditingWashroomId(null)
                            }
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          {washroom.name}
                        </td>
                        <td className="p-4">
                          {washroom.code}
                        </td>
                        <td className="p-4">
                          {washroom.floor}
                        </td>
                        <td className="p-4">
                          {washroom.active
                            ? "Yes"
                            : "No"}
                        </td>

                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              startWashroomEdit(
                                washroom
                              )
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteWashroom(
                                washroom.id
                              )
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            Washroom Assignments
          </h2>

          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 text-left">
                    Washroom
                  </th>
                  <th className="p-4 text-left">
                    Supervisor
                  </th>
                  <th className="p-4 text-left">
                     Supervisor Extra Emails
                  </th>
                  <th className="p-4 text-left">
                    Supervisor Extra Phones
                  </th>
                  <th className="p-4 text-left">
                    General Manager
                  </th>
                  <th className="p-4 text-left">
                    GM Extra Emails
                  </th>
                  <th className="p-4 text-left">
                    GM Extra Phones
                  </th>
                  <th className="p-4 text-left">
                    Owner Emails
                  </th>
                  <th className="p-4 text-left">
                    Owner Phones
                  </th>
                  
<th className="p-4 text-left">
  Actions
</th>

<th className="p-4 text-left">
  Add
</th>


                </tr>
              </thead>
<tbody>
  {assignments.map(
    (assignmentGroup) => {

      const supervisors =
        users.filter(
          (u) =>
            u.role ===
            "SUPERVISOR"
        )

      const gms =
        users.filter(
          (u) =>
            u.role ===
            "GENERAL_MANAGER"
        )

      return assignmentGroup.assignments.map(
        (assignment) => (
          <tr
            key={assignment.id}
            className="border-b"
          >
            <td className="p-4">
              {
                assignmentGroup
                  .washroom.name
              }
            </td>

            <td className="p-4">

<select
  className="border p-2 rounded w-full"

  value={
    assignment.supervisor
      .id || ""
  }

  onChange={(e) => {
    const selected =
      users.find(
        (u) =>
          u.id ===
          Number(e.target.value)
      )

    if (!selected) return

    assignment.supervisor = {
      id: selected.id,
      name: selected.name,
      email: selected.email,
      phone: selected.phone,
    }

    setAssignments([
      ...assignments,
    ])
  }}
>


                <option value="">
                  Select Supervisor
                </option>

                {supervisors.map(
                  (sup) => (
                    <option
                      key={sup.id}
                      value={sup.id}
                    >
                      {sup.name}
                    </option>
                  )
                )}
              </select>
            </td>

            <td className="p-4">
        
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.supervisorExtraEmails ||
    ""
  }

  onChange={(e) => {
    setAssignments((prev) =>
      prev.map((group) => ({
        ...group,

        assignments:
          group.assignments.map((a) =>
            a.id === assignment.id
              ? {
                  ...a,

                  supervisorExtraEmails:
                    e.target.value,
                }
              : a
          ),
      }))
    )
  }}
/>


            </td>

            <td className="p-4">
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.supervisorExtraPhones ||
    ""
  }

  

onChange={(e) => {
  setAssignments((prev) =>
    prev.map((group) => ({
      ...group,

      assignments:
        group.assignments.map(
          (a) =>
            a.id ===
            assignment.id
              ? {
                  ...a,

                  supervisorExtraPhones:
                    e.target.value,
                }
              : a
        ),
    }))
  )
}}




/>


            </td>

            <td className="p-4">
<select
  className="border p-2 rounded w-full"

  value={
    assignment
      .generalManager.id ||
    ""
  }

  onChange={(e) => {
    const selected =
      users.find(
        (u) =>
          u.id ===
          Number(e.target.value)
      )

    if (!selected) return

    assignment.generalManager =
      {
        id: selected.id,
        name: selected.name,
        email: selected.email,
        phone: selected.phone,
      }

    setAssignments([
      ...assignments,
    ])
  }}
>


                <option value="">
                  Select GM
                </option>

                {gms.map((gm) => (
                  <option
                    key={gm.id}
                    value={gm.id}
                  >
                    {gm.name}
                  </option>
                ))}
              </select>
            </td>

            <td className="p-4">
            
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.gmExtraEmails || ""
  }

  onChange={(e) => {
    setAssignments((prev) =>
      prev.map((group) => ({
        ...group,

        assignments:
          group.assignments.map((a) =>
            a.id === assignment.id
              ? {
                  ...a,

                  gmExtraEmails:
                    e.target.value,
                }
              : a
          ),
      }))
    )
  }}
/>


            </td>

            <td className="p-4">
              
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.gmExtraPhones || ""
  }

  onChange={(e) => {
    setAssignments((prev) =>
      prev.map((group) => ({
        ...group,

        assignments:
          group.assignments.map((a) =>
            a.id === assignment.id
              ? {
                  ...a,

                  gmExtraPhones:
                    e.target.value,
                }
              : a
          ),
      }))
    )
  }}
/>


            </td>

            <td className="p-4">
             
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.ownerEmails || ""
  }

  onChange={(e) => {
    setAssignments((prev) =>
      prev.map((group) => ({
        ...group,

        assignments:
          group.assignments.map((a) =>
            a.id === assignment.id
              ? {
                  ...a,

                  ownerEmails:
                    e.target.value,
                }
              : a
          ),
      }))
    )
  }}
/>


            </td>

            <td className="p-4">
        
<textarea
  className="border p-2 rounded w-full"
  rows={4}

  value={
    assignment.ownerPhones || ""
  }

 
onChange={(e) => {
  setAssignments((prev) =>
    prev.map((group) => ({
      ...group,

      assignments:
        group.assignments.map(
          (a) =>
            a.id ===
            assignment.id
              ? {
                  ...a,

                  ownerPhones:
                    e.target.value,
                }
              : a
        ),
    }))
  )
}}


/>


            </td>

            
<td className="p-4">


<div className="flex gap-2">

<button
  onClick={() =>
    saveAssignment(
      assignmentGroup,
      assignment
    )
  }

  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  Save
</button>

<button
  onClick={() =>
    deleteAssignment(
      assignment.id
    )
  }

  className="bg-red-600 text-white px-4 py-2 rounded-lg"
>
  Delete
</button>

</div>



</td>

<td className="p-4">

<button
  onClick={() =>
    addSupervisorRow(
      assignmentGroup
    )
  }

  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  + Supervisor
</button>

</td>


          </tr>
        )
      )
    }
  )}
</tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  )
}