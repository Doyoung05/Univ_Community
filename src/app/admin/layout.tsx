import Link from 'next/link'
import { LayoutDashboard, ListTree, BookOpen, Calendar, Users, ArrowLeft } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600">관리자 패널</h2>
        </div>
        <nav className="mt-2 px-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            대시보드
          </Link>
          <Link href="/admin/categories" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <ListTree className="w-5 h-5 mr-3" />
            카테고리 관리
          </Link>
          <Link href="/admin/subjects" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <BookOpen className="w-5 h-5 mr-3" />
            과목 관리
          </Link>
          <Link href="/admin/calendar" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <Calendar className="w-5 h-5 mr-3" />
            학사 일정 관리
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
            <Users className="w-5 h-5 mr-3" />
            사용자 관리
          </Link>
          <div className="pt-4 mt-4 border-t">
            <Link href="/" className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-3" />
              메인으로 돌아가기
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
