export interface Problem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  sentiment: string;
  urgency: number;
  keywords: string[];
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  status: string;
  vote_count: number;
  created_at: string;
  first_name?: string;
  username?: string;
  user_voted?: boolean;
}

export interface ProblemsResponse {
  problems: Problem[];
  total: number;
}

export interface VoteResponse {
  voted: boolean;
  voteCount: number;
}

export interface Analytics {
  categories: { category: string; count: string }[];
  sentiments: { sentiment: string; count: string }[];
  urgencyLevels: { urgency: number; count: string }[];
  topProblems: Problem[];
  stats: {
    total_problems: string;
    open_problems: string;
    resolved_problems: string;
    new_this_week: string;
    avg_urgency: string;
  };
  weeklyTop: Problem[];
  topKeywords: { keyword: string; count: string }[];
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}
