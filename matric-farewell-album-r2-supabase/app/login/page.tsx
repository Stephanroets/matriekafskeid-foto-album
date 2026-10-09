"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("The email or password is incorrect.")
      setBusy(false)
      return
    }

    router.replace("/")
    router.refresh()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Private album</p>
          <h1 className="font-serif text-4xl">Matric Farewell</h1>
          <p className="mt-3 text-sm text-white/45">Sign in with the email and password provided to you.</p>
        </div>

        <form onSubmit={login} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur md:p-8">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-white/70">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 outline-none transition focus:border-white/45"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-white/70">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 outline-none transition focus:border-white/45"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  )
}
