'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Subject } from '@/types/database'

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase.from('subjects').select('*').order('name', { ascending: true })
    if (data) setSubjects(data)
  }, [supabase])

  useEffect(() => {
    const loadData = async () => {
      await fetchSubjects()
    }
    loadData()
  }, [fetchSubjects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('subjects').insert({ name, code })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('과목이 추가되었습니다.')
      setName('')
      setCode('')
      fetchSubjects()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('과목이 삭제되었습니다.')
      fetchSubjects()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">과목 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle>새 과목 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">과목명</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 컴퓨터구조" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">과목 코드</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="예: CS101" required />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" /> 추가하기
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>과목 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">과목명</th>
                  <th className="py-2 px-4">과목 코드</th>
                  <th className="py-2 px-4 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{sub.name}</td>
                    <td className="py-2 px-4 text-gray-500">{sub.code}</td>
                    <td className="py-2 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
