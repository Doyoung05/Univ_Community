import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CheckCircle2, FileText, Tag } from 'lucide-react'
import { PostWithAuthor } from '@/types/database'

interface BoardPageProps {
  params: Promise<{ type: string }>
}

const boardNames: Record<string, string> = {
  free: '자유게시판',
  archive: '자료실',
  team: '팀원매칭',
  qna: 'Q&A',
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { type } = await params
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username), subjects(name, code), categories(name)')
    .eq('type', type)
    .order('created_at', { ascending: false })

  const posts = (data as unknown as PostWithAuthor[]) || []

  if (error) {
    console.error('Error fetching posts:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{boardNames[type] || '게시판'}</h1>
        <Link href={`/board/${type}/new`}>
          <Button>글쓰기</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/board/${type}/${post.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {type === 'qna' && post.status === 'resolved' && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {type === 'team' && post.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        )}
                        {type === 'archive' && post.file_url && (
                          <FileText className="w-4 h-4 text-blue-600" />
                        )}
                        <CardTitle className="text-xl">
                          {type === 'team' && (
                            <span className={`mr-2 text-[10px] px-2 py-0.5 rounded-full ${
                              post.status === 'active' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {post.status === 'active' ? '모집 중' : '모집 완료'}
                            </span>
                          )}
                          {post.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {post.subjects && (
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded w-fit">
                            {post.subjects.name}
                          </span>
                        )}
                        {type === 'team' && post.tags && post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center">
                            <Tag className="w-2.5 h-2.5 mr-1" /> {tag}
                          </span>
                        ))}
                        {type === 'team' && post.tags && post.tags.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{post.profiles?.username || '익명'}</span>
                    {type === 'qna' && (
                      <>
                        <span className="mx-2">•</span>
                        <span className={post.status === 'resolved' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                          {post.status === 'resolved' ? '해결됨' : '답변 대기 중'}
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            게시글이 없습니다. 첫 번째 글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  )
}
