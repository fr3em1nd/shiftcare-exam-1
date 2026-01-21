export interface DoctorSchedule {
  name: string;
  timezone: string;
  day_of_week: string;
  available_at: string;
  available_until: string;
}

export interface Doctor {
  id: string;
  name: string;
  timezone: string;
  schedules: WeeklySchedule[];
}

export interface WeeklySchedule {
  day_of_week: string;
  available_at: string;
  available_until: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  day_of_week: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorTimezone: string;
  date: string;
  day_of_week: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export type RootStackParamList = {
  DoctorsList: undefined;
  DoctorDetail: { doctor: Doctor };
  BookingConfirmation: { slot: TimeSlot; doctor: Doctor };
  MyBookings: undefined;
};
