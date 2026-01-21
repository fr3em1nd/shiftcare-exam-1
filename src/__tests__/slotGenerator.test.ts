import {
  parseTime,
  formatTime,
  formatTimeDisplay,
  getDayOfWeek,
  formatDate,
  formatDateDisplay,
  generateSlotsForSchedule,
  generateDoctorSlots,
  createDoctorId,
} from '../utils/slotGenerator';
import { Doctor, Booking, WeeklySchedule } from '../types';

describe('slotGenerator utility functions', () => {
  describe('parseTime', () => {
    it('should parse AM times correctly', () => {
      expect(parseTime('9:00AM')).toEqual({ hours: 9, minutes: 0 });
      expect(parseTime(' 9:00AM')).toEqual({ hours: 9, minutes: 0 });
      expect(parseTime('10:30AM')).toEqual({ hours: 10, minutes: 30 });
      expect(parseTime('11:45AM')).toEqual({ hours: 11, minutes: 45 });
    });

    it('should parse PM times correctly', () => {
      expect(parseTime('1:00PM')).toEqual({ hours: 13, minutes: 0 });
      expect(parseTime('2:30PM')).toEqual({ hours: 14, minutes: 30 });
      expect(parseTime('5:00PM')).toEqual({ hours: 17, minutes: 0 });
    });

    it('should handle 12:00AM (midnight) correctly', () => {
      expect(parseTime('12:00AM')).toEqual({ hours: 0, minutes: 0 });
    });

    it('should handle 12:00PM (noon) correctly', () => {
      expect(parseTime('12:00PM')).toEqual({ hours: 12, minutes: 0 });
    });

    it('should handle leading spaces', () => {
      expect(parseTime(' 9:00AM')).toEqual({ hours: 9, minutes: 0 });
      expect(parseTime('  10:30PM')).toEqual({ hours: 22, minutes: 30 });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseTime('invalid')).toThrow('Invalid time format');
      expect(() => parseTime('9AM')).toThrow('Invalid time format');
      expect(() => parseTime('nine:00AM')).toThrow('Invalid time format');
    });
  });

  describe('formatTime', () => {
    it('should format times with leading zeros', () => {
      expect(formatTime(9, 0)).toBe('09:00');
      expect(formatTime(0, 0)).toBe('00:00');
      expect(formatTime(14, 30)).toBe('14:30');
      expect(formatTime(23, 59)).toBe('23:59');
    });
  });

  describe('formatTimeDisplay', () => {
    it('should format AM times for display', () => {
      expect(formatTimeDisplay('09:00')).toBe('9:00 AM');
      expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
      expect(formatTimeDisplay('11:30')).toBe('11:30 AM');
    });

    it('should format PM times for display', () => {
      expect(formatTimeDisplay('13:00')).toBe('1:00 PM');
      expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
      expect(formatTimeDisplay('17:30')).toBe('5:30 PM');
      expect(formatTimeDisplay('23:45')).toBe('11:45 PM');
    });
  });

  describe('getDayOfWeek', () => {
    it('should return correct day names', () => {
      // January 6, 2025 is a Monday
      expect(getDayOfWeek(new Date('2025-01-06'))).toBe('monday');
      expect(getDayOfWeek(new Date('2025-01-07'))).toBe('tuesday');
      expect(getDayOfWeek(new Date('2025-01-08'))).toBe('wednesday');
      expect(getDayOfWeek(new Date('2025-01-09'))).toBe('thursday');
      expect(getDayOfWeek(new Date('2025-01-10'))).toBe('friday');
      expect(getDayOfWeek(new Date('2025-01-11'))).toBe('saturday');
      expect(getDayOfWeek(new Date('2025-01-12'))).toBe('sunday');
    });
  });

  describe('formatDate', () => {
    it('should format dates as ISO strings', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2025-01-15');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format dates for user display', () => {
      const result = formatDateDisplay('2025-01-15');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });
  });

  describe('createDoctorId', () => {
    it('should create lowercase IDs with hyphens', () => {
      expect(createDoctorId('Dr. John Smith')).toBe('dr--john-smith');
      expect(createDoctorId("Jane O'Connor")).toBe('jane-o-connor');
      expect(createDoctorId('Simple Name')).toBe('simple-name');
    });

    it('should handle special characters', () => {
      expect(createDoctorId('Dr. Test Name Jr.')).toBe('dr--test-name-jr-');
    });
  });

  describe('generateSlotsForSchedule', () => {
    const mockDoctor: Doctor = {
      id: 'test-doctor',
      name: 'Test Doctor',
      timezone: 'Australia/Sydney',
      schedules: [],
    };

    const mockSchedule: WeeklySchedule = {
      day_of_week: 'monday',
      available_at: '9:00AM',
      available_until: '11:00AM',
    };

    it('should generate correct number of 30-minute slots', () => {
      const date = new Date('2025-01-06'); // Monday
      const slots = generateSlotsForSchedule(mockDoctor, mockSchedule, date, []);

      // 9:00-11:00 = 4 slots (9:00, 9:30, 10:00, 10:30)
      expect(slots).toHaveLength(4);
    });

    it('should generate slots with correct times', () => {
      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, mockSchedule, date, []);

      expect(slots[0].startTime).toBe('09:00');
      expect(slots[0].endTime).toBe('09:30');
      expect(slots[1].startTime).toBe('09:30');
      expect(slots[1].endTime).toBe('10:00');
      expect(slots[2].startTime).toBe('10:00');
      expect(slots[2].endTime).toBe('10:30');
      expect(slots[3].startTime).toBe('10:30');
      expect(slots[3].endTime).toBe('11:00');
    });

    it('should mark booked slots correctly', () => {
      const date = new Date('2025-01-06');
      const bookedSlots: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'test-doctor',
          doctorName: 'Test Doctor',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-06',
          day_of_week: 'monday',
          startTime: '09:30',
          endTime: '10:00',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const slots = generateSlotsForSchedule(mockDoctor, mockSchedule, date, bookedSlots);

      expect(slots[0].isBooked).toBe(false);
      expect(slots[1].isBooked).toBe(true); // 9:30 slot is booked
      expect(slots[2].isBooked).toBe(false);
      expect(slots[3].isBooked).toBe(false);
    });

    it('should not create partial slots at end of window', () => {
      const shortSchedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '9:45AM',
      };

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, shortSchedule, date, []);

      // Only 1 full 30-minute slot fits (9:00-9:30)
      expect(slots).toHaveLength(1);
      expect(slots[0].startTime).toBe('09:00');
      expect(slots[0].endTime).toBe('09:30');
    });

    it('should handle PM schedules correctly', () => {
      const pmSchedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '1:00PM',
        available_until: '2:00PM',
      };

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, pmSchedule, date, []);

      expect(slots).toHaveLength(2);
      expect(slots[0].startTime).toBe('13:00');
      expect(slots[1].startTime).toBe('13:30');
    });
  });

  describe('generateDoctorSlots', () => {
    const mockDoctor: Doctor = {
      id: 'test-doctor',
      name: 'Test Doctor',
      timezone: 'Australia/Sydney',
      schedules: [
        {
          day_of_week: 'monday',
          available_at: '9:00AM',
          available_until: '10:00AM',
        },
        {
          day_of_week: 'wednesday',
          available_at: '2:00PM',
          available_until: '3:00PM',
        },
      ],
    };

    it('should return a Map of slots by date', () => {
      const slotsMap = generateDoctorSlots(mockDoctor, 14, []);
      expect(slotsMap).toBeInstanceOf(Map);
    });

    it('should only include days when doctor is available', () => {
      const slotsMap = generateDoctorSlots(mockDoctor, 14, []);

      for (const [dateStr] of slotsMap) {
        const date = new Date(dateStr + 'T00:00:00');
        const dayName = getDayOfWeek(date);
        expect(['monday', 'wednesday']).toContain(dayName);
      }
    });

    it('should sort slots by start time', () => {
      const doctorWithMultipleWindows: Doctor = {
        ...mockDoctor,
        schedules: [
          {
            day_of_week: 'monday',
            available_at: '2:00PM',
            available_until: '3:00PM',
          },
          {
            day_of_week: 'monday',
            available_at: '9:00AM',
            available_until: '10:00AM',
          },
        ],
      };

      const slotsMap = generateDoctorSlots(doctorWithMultipleWindows, 14, []);

      for (const [, slots] of slotsMap) {
        for (let i = 1; i < slots.length; i++) {
          expect(slots[i].startTime >= slots[i - 1].startTime).toBe(true);
        }
      }
    });
  });
});

describe('Edge cases and negative scenarios', () => {
  describe('parseTime edge cases', () => {
    it('should handle case insensitivity', () => {
      expect(parseTime('9:00am')).toEqual({ hours: 9, minutes: 0 });
      expect(parseTime('9:00Am')).toEqual({ hours: 9, minutes: 0 });
      expect(parseTime('9:00aM')).toEqual({ hours: 9, minutes: 0 });
    });

    it('should reject empty strings', () => {
      expect(() => parseTime('')).toThrow();
    });

    it('should reject malformed times', () => {
      expect(() => parseTime('9AM')).toThrow();
      expect(() => parseTime('9:00')).toThrow();
      expect(() => parseTime('AM9:00')).toThrow();
    });
  });

  describe('generateSlotsForSchedule edge cases', () => {
    const mockDoctor: Doctor = {
      id: 'test-doctor',
      name: 'Test Doctor',
      timezone: 'Australia/Sydney',
      schedules: [],
    };

    it('should return empty array for window less than 30 minutes', () => {
      const shortSchedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '9:29AM',
      };

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, shortSchedule, date, []);

      expect(slots).toHaveLength(0);
    });

    it('should handle exactly 30 minute window', () => {
      const exactSchedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '9:30AM',
      };

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, exactSchedule, date, []);

      expect(slots).toHaveLength(1);
    });

    it('should handle bookings for different doctor', () => {
      const schedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '10:00AM',
      };

      const otherDoctorBooking: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'different-doctor',
          doctorName: 'Different Doctor',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-06',
          day_of_week: 'monday',
          startTime: '09:00',
          endTime: '09:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, schedule, date, otherDoctorBooking);

      // All slots should be available since booking is for different doctor
      expect(slots.every(slot => !slot.isBooked)).toBe(true);
    });

    it('should handle bookings for different date', () => {
      const schedule: WeeklySchedule = {
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '10:00AM',
      };

      const differentDateBooking: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'test-doctor',
          doctorName: 'Test Doctor',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-13', // Different Monday
          day_of_week: 'monday',
          startTime: '09:00',
          endTime: '09:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const date = new Date('2025-01-06');
      const slots = generateSlotsForSchedule(mockDoctor, schedule, date, differentDateBooking);

      // All slots should be available since booking is for different date
      expect(slots.every(slot => !slot.isBooked)).toBe(true);
    });
  });

  describe('createDoctorId edge cases', () => {
    it('should handle empty string', () => {
      expect(createDoctorId('')).toBe('');
    });

    it('should handle only special characters', () => {
      expect(createDoctorId('...')).toBe('---');
    });

    it('should handle numbers', () => {
      expect(createDoctorId('Doctor 123')).toBe('doctor-123');
    });
  });
});
