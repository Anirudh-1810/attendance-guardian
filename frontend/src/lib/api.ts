const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

// Subject API
export const subjectAPI = {
  getAll: (semesterId: string) =>
    fetchAPI(`/subjects?semesterId=${semesterId}`),
  
  getOne: (id: string) =>
    fetchAPI(`/subjects/${id}`),
  
  create: (data: any) =>
    fetchAPI('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  
  bulkCreate: (subjects: any[], semesterId: string) =>
    fetchAPI('/subjects/bulk', { 
      method: 'POST', 
      body: JSON.stringify({ subjects, semesterId }) 
    }),
  
  update: (id: string, data: any) =>
    fetchAPI(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchAPI(`/subjects/${id}`, { method: 'DELETE' }),
};

// Class API
export const classAPI = {
  getAll: (subjectId: string, startDate?: string, endDate?: string) => {
    let url = `/classes?subjectId=${subjectId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return fetchAPI(url);
  },
  
  getByDate: (date: string, semesterId: string) =>
    fetchAPI(`/classes/date/${date}?semesterId=${semesterId}`),
  
  markAttendance: (id: string, status: string, notes?: string) =>
    fetchAPI(`/classes/${id}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  
  bulkMarkAttendance: (updates: Array<{ id: string; status: string; notes?: string }>) =>
    fetchAPI('/classes/bulk-attendance', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    }),
  
  create: (data: any) =>
    fetchAPI('/classes', { method: 'POST', body: JSON.stringify(data) }),
  
  bulkCreate: (classes: any[]) =>
    fetchAPI('/classes/bulk', {
      method: 'POST',
      body: JSON.stringify({ classes }),
    }),
  
  update: (id: string, data: any) =>
    fetchAPI(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    fetchAPI(`/classes/${id}`, { method: 'DELETE' }),
};

// Holiday API
export const holidayAPI = {
  getAll: (semesterId: string) =>
    fetchAPI(`/holidays?semesterId=${semesterId}`),
  
  create: (data: any) =>
    fetchAPI('/holidays', { method: 'POST', body: JSON.stringify(data) }),
  
  bulkCreate: (holidays: any[]) =>
    fetchAPI('/holidays/bulk', {
      method: 'POST',
      body: JSON.stringify({ holidays }),
    }),
  
  delete: (id: string) =>
    fetchAPI(`/holidays/${id}`, { method: 'DELETE' }),
};

// Stats API
export const statsAPI = {
  getSemesterStats: (semesterId: string) =>
    fetchAPI(`/stats/semester/${semesterId}`),
  
  getSubjectTrend: (subjectId: string) =>
    fetchAPI(`/stats/subject/${subjectId}/trend`),
};

export { ApiError };
