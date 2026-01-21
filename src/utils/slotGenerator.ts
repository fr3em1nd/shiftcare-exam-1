import { Doctor, TimeSlot, Booking, WeeklySchedule } from '../types';

const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);

  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  return days;
}

export function getDayOfWeek(date: Date): string {
  return DAYS_OF_WEEK[date.getDay()];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function generateSlotsForSchedule(
  doctor: Doctor,
  schedule: WeeklySchedule,
  date: Date,
  bookedSlots: Booking[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = formatDate(date);

  const startTime = parseTime(schedule.available_at);
  const endTime = parseTime(schedule.available_until);

  let currentHours = startTime.hours;
  let currentMinutes = startTime.minutes;

  while (
    currentHours < endTime.hours ||
    (currentHours === endTime.hours && currentMinutes < endTime.minutes)
  ) {
    const slotStartTime = formatTime(currentHours, currentMinutes);

    let endHours = currentHours;
    let endMinutes = currentMinutes + 30;
    if (endMinutes >= 60) {
      endMinutes -= 60;
      endHours += 1;
    }

    if (
      endHours > endTime.hours ||
      (endHours === endTime.hours && endMinutes > endTime.minutes)
    ) {
      break;
    }

    const slotEndTime = formatTime(endHours, endMinutes);
    const slotId = `${doctor.id}-${dateStr}-${slotStartTime}`;

    const isBooked = bookedSlots.some(
      (booking) =>
        booking.doctorId === doctor.id &&
        booking.date === dateStr &&
        booking.startTime === slotStartTime
    );

    slots.push({
      id: slotId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: dateStr,
      day_of_week: schedule.day_of_week,
      startTime: slotStartTime,
      endTime: slotEndTime,
      isBooked,
    });

    currentMinutes += 30;
    if (currentMinutes >= 60) {
      currentMinutes -= 60;
      currentHours += 1;
    }
  }

  return slots;
}

export function generateDoctorSlots(
  doctor: Doctor,
  daysAhead: number,
  bookedSlots: Booking[]
): Map<string, TimeSlot[]> {
  const slotsByDate = new Map<string, TimeSlot[]>();
  const dates = getNextDays(daysAhead);

  for (const date of dates) {
    const dayOfWeek = getDayOfWeek(date);
    const dateStr = formatDate(date);

    const daySchedules = doctor.schedules.filter(
      (s) => s.day_of_week.toLowerCase() === dayOfWeek
    );

    if (daySchedules.length > 0) {
      const daySlots: TimeSlot[] = [];

      for (const schedule of daySchedules) {
        const slots = generateSlotsForSchedule(doctor, schedule, date, bookedSlots);
        daySlots.push(...slots);
      }

      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (daySlots.length > 0) {
        slotsByDate.set(dateStr, daySlots);
      }
    }
  }

  return slotsByDate;
}

export function createDoctorId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}
