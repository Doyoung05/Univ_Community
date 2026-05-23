'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { ShieldCheck, User as UserIcon } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(profile?.role || 'user')
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setRole(null)
      }

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-red-700 hover:opacity-80 transition-opacity">
            고대커뮤
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/board/free" className="text-sm font-medium text-gray-600 hover:text-red-700 transition-colors">자유게시판</Link>
            <Link href="/board/archive" className="text-sm font-medium text-gray-600 hover:text-red-700 transition-colors">자료실</Link>
            <Link href="/board/team" className="text-sm font-medium text-gray-600 hover:text-red-700 transition-colors">팀원매칭</Link>
            <Link href="/board/qna" className="text-sm font-medium text-gray-600 hover:text-red-700 transition-colors">Q&A</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            user ? (
              <>
                <div className="flex items-center space-x-3 mr-2 px-3 py-1.5 bg-gray-50 rounded-full border">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-red-700" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 max-w-[150px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </div>

                {role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                      <ShieldCheck className="w-4 h-4 mr-1.5" /> 관리자
                    </Button>
                  </Link>
                )}

                <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600">
                  로그아웃
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-red-700 hover:bg-red-800 font-medium">회원가입</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
