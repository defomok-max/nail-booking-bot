const API_BASE = '/api';

let initData = '';

export function setInitData(data: string) {
  initData = data;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (initData) {
    headers['x-telegram-init-data'] = initData;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  emoji: string;
}

export interface Booking {
  id: number;
  user_id: number;
  user_name: string;
  service_id: number;
  service_name: string;
  date: string;
  time: string;
  status: string;
  price: number;
  duration: number;
  emoji: string;
  created_at: string;
}

export interface DateAvailability {
  date: string;
  available: boolean;
}

export const api = {
  getServices: () => request<Service[]>('/services'),

  getAvailableDates: (month: number, year: number) =>
    request<{ dates: DateAvailability[] }>(`/bookings/available-dates?month=${month}&year=${year}`),

  getAvailableSlots: (date: string, serviceId: number) =>
    request<{ slots: string[] }>(`/bookings/available-slots?date=${date}&service_id=${serviceId}`),

  createBooking: (data: { service_id: number; date: string; time: string }) =>
    request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getMyBookings: () => request<Booking[]>('/bookings/my'),

  cancelBooking: (id: number) =>
    request<{ success: boolean }>(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  admin: {
    getBookings: (params?: { date?: string; status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request<Booking[]>(`/admin/bookings${query ? '?' + query : ''}`);
    },
    getSchedule: () => request<any[]>('/admin/schedule'),
    updateSchedule: (id: number, data: any) =>
      request<{ success: boolean }>(`/admin/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getDayOffs: () => request<any[]>('/admin/day-offs'),
    addDayOff: (date: string, reason?: string) =>
      request<{ success: boolean }>('/admin/day-offs', { method: 'POST', body: JSON.stringify({ date, reason }) }),
    deleteDayOff: (id: number) =>
      request<{ success: boolean }>(`/admin/day-offs/${id}`, { method: 'DELETE' }),
    cancelBooking: (id: number) =>
      request<{ success: boolean }>(`/admin/bookings/${id}/cancel`, { method: 'PATCH' }),
    completeBooking: (id: number) =>
      request<{ success: boolean }>(`/admin/bookings/${id}/complete`, { method: 'PATCH' }),
    getStats: () => request<{ today: number; week: number; month: number; revenue: number }>('/admin/stats'),
    checkAdmin: () => request<{ isAdmin: boolean }>('/admin/check'),
  },
};
