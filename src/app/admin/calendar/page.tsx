'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { CalendarEvent } from '@/types/database'

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from('calendar_events').select('*').order('start_date', { ascending: true })
    if (data) setEvents(data)
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      await fetchEvents()
    }
    loadData()
    return () => { isMounted = false }
  }, [fetchEvents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('calendar_events').insert({
      title,
      description,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString()
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('학사 일정이 추가되었습니다.')
      setTitle('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      fetchEvents()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('calendar_events').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('일정이 삭제되었습니다.')
      fetchEvents()
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">학사 일정 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle>새 일정 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">일정 제목</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 중간고사 기간" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일</Label>
                <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일</Label>
                <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="일정에 대한 상세 설명" />
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" /> 추가하기
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>일정 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">제목</th>
                  <th className="py-2 px-4">기간</th>
                  <th className="py-2 px-4 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{event.title}</td>
                    <td className="py-2 px-4 text-sm text-gray-500">
                      {format(new Date(event.start_date), 'yyyy-MM-dd HH:mm')} ~ {format(new Date(event.end_date), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
