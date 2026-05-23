'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
      is_private: isPrivate,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('댓글이 등록되었습니다.')
      setContent('')
      setIsPrivate(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="댓글을 입력하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="private" 
            checked={isPrivate} 
            onCheckedChange={(checked) => setIsPrivate(checked === true)}
          />
          <Label htmlFor="private" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            비밀 댓글로 작성
          </Label>
        </div>
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? '등록 중...' : '댓글 등록'}
        </Button>
      </div>
    </form>
  )
}
