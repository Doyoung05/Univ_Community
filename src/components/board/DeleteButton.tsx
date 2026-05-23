'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteButtonProps {
  id: string
  type: 'post' | 'comment'
  redirectPath?: string
}

export function DeleteButton({ id, type, redirectPath }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`정말로 이 ${type === 'post' ? '게시글' : '댓글'}을 삭제하시겠습니까?`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from(type === 'post' ? 'posts' : 'comments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(`${type === 'post' ? '게시글' : '댓글'}이 삭제되었습니다.`)
      
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.refresh()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      toast.error('삭제 처리 중 오류가 발생했습니다: ' + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="sm" 
      variant="ghost" 
      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="w-4 h-4 mr-1" />
      {loading ? '삭제 중...' : '삭제'}
    </Button>
  )
}
