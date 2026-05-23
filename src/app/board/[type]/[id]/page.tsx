import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CommentForm } from '@/components/board/CommentForm'
import { Lock, Download, CheckCircle2, FileText, Tag, Calendar, Users, Info } from 'lucide-react'
import { AcceptButton } from '@/components/board/AcceptButton'
import { DeleteButton } from '@/components/board/DeleteButton'
import { StatusToggleButton } from '@/components/board/StatusToggleButton'
import { PostWithAuthor, CommentWithAuthor } from '@/types/database'

interface PostDetailPageProps {
  params: Promise<{ type: string; id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { type, id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(username),
      categories(name),
      subjects(name, code)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Post fetch error:', error)
    return notFound()
  }

  const post = data as unknown as PostWithAuthor

  const { data: commentsData } = await supabase
    .from('comments')
    .select('*, profiles(username)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const comments = (commentsData as unknown as CommentWithAuthor[]) || []

  const isAuthor = user?.id === post.author_id
  const isQna = post.type === 'qna'
  const isTeam = post.type === 'team'
  const isResolved = post.status === 'resolved'
  const isCompleted = post.status === 'completed'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/board/${type}`} className="text-blue-600 hover:underline">
          &larr; 목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          {isAuthor && isTeam && (
            <StatusToggleButton postId={id} currentStatus={post.status} />
          )}
          {isAuthor && (
            <DeleteButton id={id} type="post" redirectPath={`/board/${type}`} />
          )}
          {isResolved && (
            <span className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4 mr-1" /> 해결됨
            </span>
          )}
          {isCompleted && isTeam && (
            <span className="flex items-center text-gray-600 font-bold bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              모집 완료
            </span>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{post.categories?.name || '일반'}</span>
            {post.subjects && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                {post.subjects.name} ({post.subjects.code})
              </span>
            )}
            <span>•</span>
            <span>{post.profiles?.username || '익명'}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}</span>
          </div>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
          
          {isTeam && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> {tag}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isTeam && post.recruitment_data && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-red-800 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">주제</p>
                  <p className="text-sm font-medium text-gray-900">{post.recruitment_data.topic}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-red-800 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">활동 기간</p>
                  <p className="text-sm font-medium text-gray-900">{post.recruitment_data.period}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-red-800 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">공모전 종류</p>
                  <p className="text-sm font-medium text-gray-900">{post.recruitment_data.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-red-800 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">모집 인원</p>
                  <p className="text-sm font-medium text-gray-900">{post.recruitment_data.members}</p>
                </div>
              </div>
            </div>
          )}

          <div className="prose max-w-none whitespace-pre-wrap mb-8">
            {post.content}
          </div>

          {post.file_url && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">첨부 파일이 있습니다.</span>
              </div>
              <a 
                href={post.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                download
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Download className="w-4 h-4 mr-2" /> 다운로드
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-bold">댓글 {comments.length}</h3>
        
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-4 rounded-lg border ${
                  comment.is_accepted 
                    ? 'bg-green-50 border-green-200 ring-1 ring-green-200' 
                    : comment.is_private ? 'bg-gray-50 border-dashed' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.profiles?.username || '익명'}</span>
                    {comment.is_private && (
                      <span className="flex items-center text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3 mr-1" /> 비밀 댓글
                      </span>
                    )}
                    {comment.is_accepted && (
                      <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded font-bold">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> 채택된 답변
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                    </span>
                    {user?.id === comment.author_id && (
                      <DeleteButton id={comment.id} type="comment" />
                    )}
                    {isQna && isAuthor && !isResolved && !comment.is_accepted && user?.id !== comment.author_id && (
                      <AcceptButton postId={post.id} commentId={comment.id} />
                    )}
                  </div>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">아직 댓글이 없습니다.</p>
          )}
        </div>

        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">댓글 작성</h4>
          <CommentForm postId={id} />
        </div>
      </div>
    </div>
  )
}
