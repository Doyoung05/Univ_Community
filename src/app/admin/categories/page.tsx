'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Category } from '@/types/database'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
    if (data) setCategories(data)
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      await fetchCategories()
    }
    loadData()
    return () => { isMounted = false }
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('categories').insert({ name, slug, description })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('카테고리가 추가되었습니다.')
      setName('')
      setSlug('')
      setDescription('')
      fetchCategories()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('카테고리가 삭제되었습니다.')
      fetchCategories()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">카테고리 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle>새 카테고리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 공지사항" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">슬러그 (URL용)</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="예: notice" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="카테고리에 대한 설명" />
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" /> 추가하기
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">이름</th>
                  <th className="py-2 px-4">슬러그</th>
                  <th className="py-2 px-4">설명</th>
                  <th className="py-2 px-4 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{cat.name}</td>
                    <td className="py-2 px-4 text-gray-500">{cat.slug}</td>
                    <td className="py-2 px-4 text-gray-500">{cat.description}</td>
                    <td className="py-2 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
