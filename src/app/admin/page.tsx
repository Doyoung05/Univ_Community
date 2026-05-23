import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, MessageSquare, Award } from 'lucide-react'
import { PointsHistory, Profile } from '@/types/database'

interface RecentPoint extends PointsHistory {
  profiles: Pick<Profile, 'username'> | null
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: postCount },
    { count: commentCount },
    { data: recentPointsData },
    { data: totalPointsData }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('points_history').select('*, profiles(username)').order('created_at', { ascending: false }).limit(5),
    supabase.from('points_history').select('amount')
  ])

  const recentPoints = (recentPointsData as unknown as RecentPoint[]) || []
  const totalPoints = totalPointsData?.reduce((sum, item) => sum + item.amount, 0) || 0

  const stats = [
    { title: '총 사용자', value: userCount || 0, icon: Users, color: 'text-blue-600' },
    { title: '총 게시글', value: postCount || 0, icon: FileText, color: 'text-green-600' },
    { title: '총 댓글', value: commentCount || 0, icon: MessageSquare, color: 'text-purple-600' },
    { title: '지급된 포인트', value: totalPoints.toLocaleString(), icon: Award, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>최근 포인트 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPoints.map((point) => (
                <div key={point.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{point.profiles?.username || '익명'}</p>
                    <p className="text-sm text-gray-500">{point.reason}</p>
                  </div>
                  <span className="text-green-600 font-bold">+{point.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>데이터베이스</span>
                <span className="text-green-600 font-medium">정상</span>
              </div>
              <div className="flex justify-between">
                <span>스토리지</span>
                <span className="text-green-600 font-medium">정상</span>
              </div>
              <div className="flex justify-between">
                <span>인증 서비스</span>
                <span className="text-green-600 font-medium">정상</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
