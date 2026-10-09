"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      className="rounded-full px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      Log out
    </button>
  )
}
