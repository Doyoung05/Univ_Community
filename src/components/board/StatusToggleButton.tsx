'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { toast } from 'sonner'

interface StatusToggleButtonProps {
  postId: string
  currentStatus: string
}

export function StatusToggleButton({ postId, currentStatus }: StatusToggleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('toggle_post_status', {
        p_post_id: postId
      })

      if (error) throw error

      router.refresh()
      
      const newStatus = status === 'active' ? 'completed' : 'active'
      setStatus(newStatus)
      toast.success(newStatus === 'active' ? '모집 중으로 변경되었습니다.' : '모집 완료로 변경되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      toast.error('상태 변경 중 오류가 발생했습니다: ' + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className={`flex items-center gap-2 ${
        status === 'active' 
          ? 'text-green-600 border-green-200 hover:bg-green-50' 
          : 'text-gray-500 border-gray-200 hover:bg-gray-50'
      }`}
      onClick={handleToggle}
      disabled={loading}
    >
      {status === 'active' ? (
        <>
          <CircleDashed className="w-4 h-4" />
          모집 중
        </>
      ) : (
        <>
          <CircleCheck className="w-4 h-4" />
          모집 완료
        </>
      )}
    </Button>
  )
}
