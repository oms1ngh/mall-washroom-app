"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
    >
      Logout
    </button>
  )
}