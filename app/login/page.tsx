"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError("Invalid email or password")
      return
    }

    const sessionRes = await fetch("/api/auth/session")
    const session = await sessionRes.json()

    const role = session?.user?.role

    if (role === "SUPER_ADMIN") {
      router.push("/dashboard/super-admin")
      return
    }

    if (role === "OWNER") {
      router.push("/dashboard/owner")
      return
    }

    if (role === "SUPERVISOR") {
      router.push("/dashboard/supervisor")
      return
    }

    if (role === "GENERAL_MANAGER") {
      router.push("/dashboard/gm")
      return
    }

    setError("Access denied")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
        
        {/* Left Branding */}
        <div className="bg-gradient-to-br from-pink-600 to-slate-800 text-white p-10 flex flex-col justify-center items-center">
          <Image
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            width={180}
            height={180}
            className="rounded-2xl bg-white p-3 shadow-lg"
          />

          <h1 className="text-4xl font-bold mt-8 text-center">
            South Avenue Mall
          </h1>

          <p className="mt-4 text-lg text-center opacity-90">
            Washroom Monitoring & Complaint Management System
          </p>
        </div>

        {/* Right Login */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-slate-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-slate-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold p-4 rounded-xl shadow-lg transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}