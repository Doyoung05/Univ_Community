export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at'>
        Update: Partial<Omit<Subject, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>
      }
      points_history: {
        Row: PointsHistory
        Insert: Omit<PointsHistory, 'id' | 'created_at'>
        Update: Partial<Omit<PointsHistory, 'id' | 'created_at'>>
      }
      calendar_events: {
        Row: CalendarEvent
        Insert: Omit<CalendarEvent, 'id' | 'created_at'>
        Update: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  student_id: string | null
  points: number
  role: 'user' | 'admin'
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  category_id: string
  subject_id: string | null
  title: string
  content: string
  type: 'free' | 'archive' | 'team' | 'qna'
  status: 'active' | 'resolved' | 'closed' | 'completed'
  file_url?: string | null
  tags?: string[] | null
  recruitment_data?: {
    topic: string
    type: string
    members: string
    period: string
  } | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  is_private: boolean
  is_accepted: boolean
  created_at: string
}

export interface PointsHistory {
  id: string
  profile_id: string
  amount: number
  reason: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  created_at: string
}

// Joined types for convenience
export interface PostWithAuthor extends Post {
  profiles: Pick<Profile, 'username'> | null
  subjects: Pick<Subject, 'name' | 'code'> | null
  categories?: Pick<Category, 'name'> | null
}

export interface CommentWithAuthor extends Comment {
  profiles: Pick<Profile, 'username'> | null
}
