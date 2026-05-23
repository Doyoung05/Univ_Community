import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Award, Bell, FileText, Users } from "lucide-react";

const boardNames: Record<string, string> = {
  free: '자유게시판',
  archive: '자료실',
  team: '팀원매칭',
  qna: 'Q&A',
}

export default async function Home() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: topUsers } = await supabase
    .from("profiles")
    .select("username, points")
    .order("points", { ascending: false })
    .limit(10);

  const { data: calendarEvents } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-red-800 text-white rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">고려대학교 학생 커뮤니티</h1>
            <p className="text-xl opacity-90">
              지식 공유부터 팀원 매칭까지, 고대생들만의 공간입니다.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <Users size={300} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-red-800" />
                  최신 게시글
                </h2>
                <Link href="/board/free" className="text-sm text-red-700 hover:underline font-medium">
                  전체보기
                </Link>
              </div>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden divide-y">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/board/${post.type}/${post.id}`}
                      className="block p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 uppercase tracking-wider mb-2">
                            {boardNames[post.type] || post.type}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <div className="w-5 h-5 rounded-full bg-gray-200 mr-2" />
                        {post.profiles?.username || "익명"}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    게시글이 없습니다.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-sm border-none ring-1 ring-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-800" />
                  공지사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start group cursor-pointer">
                    <span className="text-red-700 mr-2 font-bold">•</span>
                    <span className="group-hover:text-red-800 transition-colors">커뮤니티 이용 규칙 안내</span>
                  </li>
                  <li className="flex items-start group cursor-pointer">
                    <span className="text-red-700 mr-2 font-bold">•</span>
                    <span className="group-hover:text-red-800 transition-colors">@korea.ac.kr 이메일 인증 필수</span>
                  </li>
                  <li className="flex items-start group cursor-pointer">
                    <span className="text-red-700 mr-2 font-bold">•</span>
                    <span className="group-hover:text-red-800 transition-colors">자료실 업로드 가이드</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none ring-1 ring-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  포인트 랭킹 (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topUsers && topUsers.length > 0 ? (
                  <div className="space-y-1">
                    {topUsers.map((user, index) => (
                      <div key={user.username} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold mr-3 ${
                            index === 0 ? 'bg-yellow-400 text-white shadow-sm' : 
                            index === 1 ? 'bg-gray-300 text-white shadow-sm' :
                            index === 2 ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate max-w-[120px]">{user.username}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600">{user.points.toLocaleString()} P</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    랭킹 정보가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none ring-1 ring-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-800" />
                  학사 일정
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calendarEvents && calendarEvents.length > 0 ? (
                  <ul className="space-y-4">
                    {calendarEvents.map((event) => (
                      <li key={event.id} className="flex flex-col">
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                          {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 leading-tight mt-1">{event.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    예정된 일정이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
