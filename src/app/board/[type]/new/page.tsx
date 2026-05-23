'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Paperclip, X } from 'lucide-react'
import { Category, Subject, Post } from '@/types/database'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subjectId, setSubjectId] = useState<string>('none')
  const [categories, setCategories] = useState<Category[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Recruitment specific fields
  const [recruitmentData, setRecruitmentData] = useState({
    topic: '',
    type: '',
    members: '',
    period: '',
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const router = useRouter()
  const params = useParams()
  const type = params.type as string
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, subRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('subjects').select('*')
      ])
      
      if (catRes.data) {
        setCategories(catRes.data)
        const currentCat = catRes.data.find(c => c.slug === type)
        if (currentCat) {
          setCategoryId(currentCat.id)
        } else if (catRes.data.length > 0) {
          setCategoryId(catRes.data[0].id)
        }
      }
      if (subRes.data) {
        setSubjects(subRes.data)
      }
    }
    fetchData()
  }, [supabase, type])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    let fileUrl = null
    let uploadedFileName = null
    if (file && type === 'archive') {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      uploadedFileName = fileName
      const { error: uploadError } = await supabase.storage
        .from('archives')
        .upload(fileName, file)

      if (uploadError) {
        toast.error('파일 업로드 실패: ' + uploadError.message)
        setLoading(false)
        return
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('archives')
        .getPublicUrl(fileName)
      
      fileUrl = publicUrl
    }

    const postData: Partial<Post> = {
      title,
      content,
      type: type as Post['type'],
      category_id: categoryId,
      subject_id: subjectId === 'none' ? null : subjectId,
      author_id: user.id,
      file_url: fileUrl,
    }

    if (type === 'team') {
      postData.recruitment_data = recruitmentData
      postData.tags = tags
    }

    const { error } = await supabase.from('posts').insert(postData)

    if (error) {
      if (uploadedFileName) {
        await supabase.storage.from('archives').remove([uploadedFileName])
      }
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('게시글이 작성되었습니다.')
      router.push(`/board/${type}`)
      router.refresh()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>
            {type === 'free' && '자유게시판 새 글'}
            {type === 'archive' && '자료실 새 글'}
            {type === 'qna' && 'Q&A 새 글'}
            {type === 'team' && '팀원 모집 새 글'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>게시판 카테고리</Label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm border font-medium">
                  {categories.find(c => c.id === categoryId)?.name || "로딩 중..."}
                </div>
              </div>
              {type !== 'team' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">과목 (선택)</Label>
                  <Select value={subjectId} onValueChange={(val) => val && setSubjectId(val)}>
                    <SelectTrigger>
                      <SelectValue>
                        {subjectId === 'none' ? "선택 안 함" : 
                         subjects.find(s => s.id === subjectId) ? 
                         `${subjects.find(s => s.id === subjectId)?.name} (${subjects.find(s => s.id === subjectId)?.code})` : 
                         "과목 선택"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">선택 안 함</SelectItem>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {type === 'team' && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-4">
                <h3 className="text-sm font-bold text-red-900 flex items-center">
                  🚩 팀원 모집 템플릿
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-xs">주제</Label>
                    <Input 
                      id="topic" 
                      placeholder="예: 지능형 로봇 경진대회" 
                      value={recruitmentData.topic}
                      onChange={(e) => setRecruitmentData({...recruitmentData, topic: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recType" className="text-xs">공모전 종류</Label>
                    <Input 
                      id="recType" 
                      placeholder="예: IT/창업 공모전" 
                      value={recruitmentData.type}
                      onChange={(e) => setRecruitmentData({...recruitmentData, type: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="members" className="text-xs">모집 인원</Label>
                    <Input 
                      id="members" 
                      placeholder="예: 개발자 2명, 디자이너 1명" 
                      value={recruitmentData.members}
                      onChange={(e) => setRecruitmentData({...recruitmentData, members: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period" className="text-xs">활동 기간</Label>
                    <Input 
                      id="period" 
                      placeholder="예: 2024년 6월 ~ 8월" 
                      value={recruitmentData.period}
                      onChange={(e) => setRecruitmentData({...recruitmentData, period: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-xs">필요 역량 태그 (엔터를 눌러 추가)</Label>
                  <Input 
                    id="tags" 
                    placeholder="예: Python, 회로설계, 영상처리" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="bg-white border border-red-200 text-red-700 px-2 py-1 rounded-md text-xs flex items-center shadow-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">게시글 제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            {type === 'archive' && (
              <div className="space-y-2">
                <Label htmlFor="file">파일 첨부</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && <Paperclip className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content">상세 내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상세 정보를 입력하세요"
                rows={10}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-800 hover:bg-red-900">
              {loading ? '저장 중...' : '게시글 등록'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
