'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

interface AcceptButtonProps {
  postId: string
  commentId: string
}

export function AcceptButton({ postId, commentId }: AcceptButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAccept = async () => {
    if (!confirm('이 답변을 채택하시겠습니까? 채택 후에는 변경할 수 없습니다.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.rpc('accept_answer', {
        p_post_id: postId,
        p_comment_id: commentId,
        p_points: 100 // 채택 포인트 100점
      })

      if (error) throw error

      toast.success('답변이 채택되었습니다. 포인트가 지급되었습니다.')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      toast.error('채택 처리 중 오류가 발생했습니다: ' + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
      onClick={handleAccept}
      disabled={loading}
    >
      <Check className="w-4 h-4 mr-1" />
      {loading ? '처리 중...' : '채택하기'}
    </Button>
  )
}
