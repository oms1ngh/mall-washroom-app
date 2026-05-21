import Image from "next/image"
import LogoutButton from "./LogoutButton"

type Props = {
  title: string
  userName?: string
}

export default function Navbar({ title, userName }: Props) {
  return (
    <header className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            width={80}
            height={80}
            className="object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">
              South Avenue Mall Washroom Monitoring System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-slate-700 font-medium">
              Welcome, {userName}
            </span>
          )}

          <LogoutButton />
        </div>
      </div>
    </header>
  )
}