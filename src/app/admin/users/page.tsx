'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Award, Search } from 'lucide-react'
import { Profile } from '@/types/database'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [pointAmount, setPointAmount] = useState(0)
  const [pointReason, setPointReason] = useState('')
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('사용자 목록을 불러오지 못했습니다.')
    } else if (data) {
      setUsers(data as Profile[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers()
    }
    loadData()
  }, [fetchUsers])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.rpc('update_user_role', { 
      target_user_id: userId,
      new_role: newRole
    })

    if (error) {
      toast.error('권한 변경에 실패했습니다: ' + error.message)
    } else {
      toast.success('권한이 변경되었습니다.')
      fetchUsers()
    }
  }

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    if (pointAmount === 0) {
      toast.error('조정할 포인트 금액을 입력해주세요.')
      return
    }

    const { error } = await supabase.rpc('adjust_points', {
      p_user_id: selectedUser.id,
      p_amount: pointAmount,
      p_reason: pointReason
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('포인트가 조정되었습니다.')
      setSelectedUser(null)
      setPointAmount(0)
      setPointReason('')
      fetchUsers()
    }
  }

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
    (user.full_name?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
    (user.student_id ?? '').includes(search)
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="이름, 아이디, 학번 검색" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-3 px-4 font-medium">사용자</th>
                  <th className="py-3 px-4 font-medium">학번</th>
                  <th className="py-3 px-4 font-medium">역할</th>
                  <th className="py-3 px-4 font-medium">포인트</th>
                  <th className="py-3 px-4 font-medium text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium">{user.full_name || '이름 없음'}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.student_id || '-'}</td>
                    <td className="py-3 px-4">
                      <Select 
                        value={user.role} 
                        onValueChange={(value) => value && handleUpdateRole(user.id, value)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">일반</SelectItem>
                          <SelectItem value="admin">관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600">
                      {user.points.toLocaleString()} P
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Award className="w-4 h-4 mr-1" /> 포인트 조정
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Point Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                포인트 조정: {selectedUser.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdjustPoints} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">조정 금액 (차감 시 음수 입력)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    value={pointAmount} 
                    onChange={(e) => setPointAmount(parseInt(e.target.value) || 0)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">사유</Label>
                  <Input 
                    id="reason" 
                    value={pointReason} 
                    onChange={(e) => setPointReason(e.target.value)} 
                    placeholder="예: 이벤트 당첨 보상, 부정 포인트 회수 등"
                    required 
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)}>취소</Button>
                  <Button type="submit">적용하기</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
