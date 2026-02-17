const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Semester API
export const semesterAPI = {
  getAll: (userId?: string) =>
    fetchAPI(`/semesters${userId ? `?userId=${userId}` : ''}`),

  getCurrent: (userId?: string) =>
    fetchAPI(`/semesters/current${userId ? `?userId=${userId}` : ''}`),

  create: (data: any) =>
    fetchAPI('/semesters', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    fetchAPI(`/semesters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchAPI(`/semesters/${id}`, { method: 'DELETE' }),
};

// Subject API (maps to /courses backend route)
export const subjectAPI = {
  getAll: (semesterId: string) =>
    fetchAPI(`/courses/${semesterId}`),

  create: (data: any) =>
    fetchAPI('/courses', { method: 'POST', body: JSON.stringify(data) }),
};

// Class API (maps to /class backend route)
export const classAPI = {
  getAll: (subjectId: string, startDate?: string, endDate?: string) => {
    let url = `/class?subjectId=${subjectId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return fetchAPI(url);
  },

  getByDate: (date: string, semesterId: string) =>
    fetchAPI(`/class/date/${date}?semesterId=${semesterId}`),

  markAttendance: (id: string, status: string, notes?: string) =>
    fetchAPI(`/class/${id}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  bulkMarkAttendance: (updates: Array<{ id: string; status: string; notes?: string }>) =>
    fetchAPI('/class/bulk-attendance', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    }),

  create: (data: any) =>
    fetchAPI('/class', { method: 'POST', body: JSON.stringify(data) }),

  bulkCreate: (classes: any[]) =>
    fetchAPI('/class/bulk', {
      method: 'POST',
      body: JSON.stringify({ classes }),
    }),

  update: (id: string, data: any) =>
    fetchAPI(`/class/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchAPI(`/class/${id}`, { method: 'DELETE' }),
};

// Holiday API (maps to /holiday backend route)
export const holidayAPI = {
  getAll: (semesterId: string) =>
    fetchAPI(`/holiday?semesterId=${semesterId}`),

  create: (data: any) =>
    fetchAPI('/holiday', { method: 'POST', body: JSON.stringify(data) }),

  bulkCreate: (holidays: any[]) =>
    fetchAPI('/holiday/bulk', {
      method: 'POST',
      body: JSON.stringify({ holidays }),
    }),

  delete: (id: string) =>
    fetchAPI(`/holiday/${id}`, { method: 'DELETE' }),
};

// Stats API
export const statsAPI = {
  getSemesterStats: (semesterId: string) =>
    fetchAPI(`/stats/semester/${semesterId}`),

  getSubjectTrend: (subjectId: string) =>
    fetchAPI(`/stats/subject/${subjectId}/trend`),
};

export { ApiError };
