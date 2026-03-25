import { getInitData } from './telegram';
import { Problem, ProblemsResponse, VoteResponse, Analytics } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const initData = getInitData();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  }

  // Don't set Content-Type for FormData
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export async function getProblems(params?: {
  category?: string;
  sort?: string;
  page?: number;
  search?: string;
}): Promise<ProblemsResponse> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', String(params.page));
  if (params?.search) query.set('search', params.search);

  const qs = query.toString();
  return fetchApi<ProblemsResponse>(`/problems${qs ? `?${qs}` : ''}`);
}

export async function getProblem(id: number): Promise<Problem> {
  return fetchApi<Problem>(`/problems/${id}`);
}

export async function createProblem(data: {
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  image_url?: string;
}): Promise<Problem> {
  return fetchApi<Problem>('/problems', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function vote(problemId: number): Promise<VoteResponse> {
  return fetchApi<VoteResponse>('/vote', {
    method: 'POST',
    body: JSON.stringify({ problem_id: problemId }),
  });
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  return fetchApi<{ url: string }>('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function getAnalytics(): Promise<Analytics> {
  return fetchApi<Analytics>('/analytics');
}
