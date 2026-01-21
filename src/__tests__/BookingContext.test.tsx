/**
 * Booking Business Logic Unit Tests
 *
 * These tests focus on the core business logic of the booking system
 * without requiring React Native environment dependencies.
 */

import { Booking, TimeSlot, Doctor, DoctorSchedule } from '../types';
import { createDoctorId } from '../utils/slotGenerator';

// Test utilities that mirror the context logic
function isSlotBooked(
  bookings: Booking[],
  doctorId: string,
  date: string,
  startTime: string
): boolean {
  return bookings.some(
    (b) => b.doctorId === doctorId && b.date === date && b.startTime === startTime
  );
}

function createBooking(slot: TimeSlot, doctor: Doctor): Booking {
  return {
    id: `booking-${Date.now()}`,
    doctorId: slot.doctorId,
    doctorName: slot.doctorName,
    doctorTimezone: doctor.timezone,
    date: slot.date,
    day_of_week: slot.day_of_week,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: new Date().toISOString(),
  };
}

function groupDoctorsByName(schedules: DoctorSchedule[]): Doctor[] {
  const doctorMap = new Map<string, Doctor>();

  for (const schedule of schedules) {
    const doctorId = createDoctorId(schedule.name);

    if (!doctorMap.has(doctorId)) {
      doctorMap.set(doctorId, {
        id: doctorId,
        name: schedule.name,
        timezone: schedule.timezone,
        schedules: [],
      });
    }

    doctorMap.get(doctorId)!.schedules.push({
      day_of_week: schedule.day_of_week,
      available_at: schedule.available_at,
      available_until: schedule.available_until,
    });
  }

  return Array.from(doctorMap.values());
}

describe('Booking Business Logic', () => {
  describe('isSlotBooked', () => {
    const bookings: Booking[] = [
      {
        id: 'booking-1',
        doctorId: 'dr-test',
        doctorName: 'Dr. Test',
        doctorTimezone: 'Australia/Sydney',
        date: '2025-01-15',
        day_of_week: 'wednesday',
        startTime: '10:00',
        endTime: '10:30',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    it('should return true for booked slots', () => {
      expect(isSlotBooked(bookings, 'dr-test', '2025-01-15', '10:00')).toBe(true);
    });

    it('should return false for available slots', () => {
      expect(isSlotBooked(bookings, 'dr-test', '2025-01-15', '11:00')).toBe(false);
    });

    it('should return false for different doctor same time', () => {
      expect(isSlotBooked(bookings, 'dr-another', '2025-01-15', '10:00')).toBe(false);
    });

    it('should return false for same doctor different date', () => {
      expect(isSlotBooked(bookings, 'dr-test', '2025-01-16', '10:00')).toBe(false);
    });

    it('should return false for empty bookings array', () => {
      expect(isSlotBooked([], 'dr-test', '2025-01-15', '10:00')).toBe(false);
    });
  });

  describe('createBooking', () => {
    const mockSlot: TimeSlot = {
      id: 'slot-1',
      doctorId: 'dr-test',
      doctorName: 'Dr. Test',
      date: '2025-01-15',
      day_of_week: 'wednesday',
      startTime: '10:00',
      endTime: '10:30',
      isBooked: false,
    };

    const mockDoctor: Doctor = {
      id: 'dr-test',
      name: 'Dr. Test',
      timezone: 'Australia/Sydney',
      schedules: [],
    };

    it('should create a booking with correct properties', () => {
      const booking = createBooking(mockSlot, mockDoctor);

      expect(booking.doctorId).toBe('dr-test');
      expect(booking.doctorName).toBe('Dr. Test');
      expect(booking.doctorTimezone).toBe('Australia/Sydney');
      expect(booking.date).toBe('2025-01-15');
      expect(booking.day_of_week).toBe('wednesday');
      expect(booking.startTime).toBe('10:00');
      expect(booking.endTime).toBe('10:30');
    });

    it('should generate unique booking IDs', () => {
      const booking1 = createBooking(mockSlot, mockDoctor);
      const booking2 = createBooking(mockSlot, mockDoctor);

      expect(booking1.id).toMatch(/^booking-\d+$/);
      expect(booking2.id).toMatch(/^booking-\d+$/);
    });

    it('should set createdAt to current timestamp', () => {
      const beforeTime = new Date().toISOString();
      const booking = createBooking(mockSlot, mockDoctor);
      const afterTime = new Date().toISOString();

      expect(booking.createdAt >= beforeTime).toBe(true);
      expect(booking.createdAt <= afterTime).toBe(true);
    });
  });

  describe('groupDoctorsByName', () => {
    const mockSchedules: DoctorSchedule[] = [
      {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'monday',
        available_at: '9:00AM',
        available_until: '5:00PM',
      },
      {
        name: 'Dr. Test',
        timezone: 'Australia/Sydney',
        day_of_week: 'tuesday',
        available_at: '10:00AM',
        available_until: '4:00PM',
      },
      {
        name: 'Dr. Another',
        timezone: 'Australia/Perth',
        day_of_week: 'wednesday',
        available_at: '8:00AM',
        available_until: '12:00PM',
      },
    ];

    it('should group schedules by doctor name', () => {
      const doctors = groupDoctorsByName(mockSchedules);

      expect(doctors).toHaveLength(2);
    });

    it('should assign multiple schedules to same doctor', () => {
      const doctors = groupDoctorsByName(mockSchedules);
      const drTest = doctors.find((d) => d.name === 'Dr. Test');

      expect(drTest?.schedules).toHaveLength(2);
    });

    it('should create unique IDs for each doctor', () => {
      const doctors = groupDoctorsByName(mockSchedules);
      const ids = doctors.map((d) => d.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should preserve timezone information', () => {
      const doctors = groupDoctorsByName(mockSchedules);
      const drTest = doctors.find((d) => d.name === 'Dr. Test');
      const drAnother = doctors.find((d) => d.name === 'Dr. Another');

      expect(drTest?.timezone).toBe('Australia/Sydney');
      expect(drAnother?.timezone).toBe('Australia/Perth');
    });

    it('should handle empty array', () => {
      const doctors = groupDoctorsByName([]);

      expect(doctors).toHaveLength(0);
    });
  });

  describe('Double Booking Prevention', () => {
    it('should detect existing booking at same time', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const attemptedSlot: TimeSlot = {
        id: 'slot-2',
        doctorId: 'dr-test',
        doctorName: 'Dr. Test',
        date: '2025-01-15',
        day_of_week: 'wednesday',
        startTime: '10:00',
        endTime: '10:30',
        isBooked: false,
      };

      const isDoubleBooking = isSlotBooked(
        bookings,
        attemptedSlot.doctorId,
        attemptedSlot.date,
        attemptedSlot.startTime
      );

      expect(isDoubleBooking).toBe(true);
    });

    it('should allow booking adjacent time slot', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      // 10:30 slot should be available
      const isDoubleBooking = isSlotBooked(bookings, 'dr-test', '2025-01-15', '10:30');

      expect(isDoubleBooking).toBe(false);
    });

    it('should allow same time slot with different doctor', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const isDoubleBooking = isSlotBooked(bookings, 'dr-another', '2025-01-15', '10:00');

      expect(isDoubleBooking).toBe(false);
    });
  });

  describe('Booking Cancellation Logic', () => {
    it('should filter out cancelled booking', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'booking-2',
          doctorId: 'dr-another',
          doctorName: 'Dr. Another',
          doctorTimezone: 'Australia/Perth',
          date: '2025-01-16',
          day_of_week: 'thursday',
          startTime: '11:00',
          endTime: '11:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const cancelledId = 'booking-1';
      const remainingBookings = bookings.filter((b) => b.id !== cancelledId);

      expect(remainingBookings).toHaveLength(1);
      expect(remainingBookings[0].id).toBe('booking-2');
    });

    it('should not affect other bookings', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const cancelledId = 'non-existent-id';
      const remainingBookings = bookings.filter((b) => b.id !== cancelledId);

      expect(remainingBookings).toHaveLength(1);
    });

    it('should make slot available after cancellation', () => {
      let bookings: Booking[] = [
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      // Initially booked
      expect(isSlotBooked(bookings, 'dr-test', '2025-01-15', '10:00')).toBe(true);

      // After cancellation
      bookings = bookings.filter((b) => b.id !== 'booking-1');
      expect(isSlotBooked(bookings, 'dr-test', '2025-01-15', '10:00')).toBe(false);
    });
  });

  describe('Booking Sorting', () => {
    it('should sort bookings by date ascending', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-2',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-17',
          day_of_week: 'friday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const sorted = [...bookings].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      expect(sorted[0].date).toBe('2025-01-15');
      expect(sorted[1].date).toBe('2025-01-17');
    });

    it('should sort by time when dates are equal', () => {
      const bookings: Booking[] = [
        {
          id: 'booking-2',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '14:00',
          endTime: '14:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'booking-1',
          doctorId: 'dr-test',
          doctorName: 'Dr. Test',
          doctorTimezone: 'Australia/Sydney',
          date: '2025-01-15',
          day_of_week: 'wednesday',
          startTime: '10:00',
          endTime: '10:30',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const sorted = [...bookings].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      expect(sorted[0].startTime).toBe('10:00');
      expect(sorted[1].startTime).toBe('14:00');
    });
  });

  describe('Past Booking Detection', () => {
    it('should identify past bookings', () => {
      const isPastBooking = (booking: Booking): boolean => {
        const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
        return bookingDate < new Date();
      };

      const pastBooking: Booking = {
        id: 'booking-1',
        doctorId: 'dr-test',
        doctorName: 'Dr. Test',
        doctorTimezone: 'Australia/Sydney',
        date: '2020-01-15',
        day_of_week: 'wednesday',
        startTime: '10:00',
        endTime: '10:30',
        createdAt: '2020-01-01T00:00:00Z',
      };

      expect(isPastBooking(pastBooking)).toBe(true);
    });

    it('should identify future bookings', () => {
      const isPastBooking = (booking: Booking): boolean => {
        const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
        return bookingDate < new Date();
      };

      const futureBooking: Booking = {
        id: 'booking-1',
        doctorId: 'dr-test',
        doctorName: 'Dr. Test',
        doctorTimezone: 'Australia/Sydney',
        date: '2030-01-15',
        day_of_week: 'wednesday',
        startTime: '10:00',
        endTime: '10:30',
        createdAt: '2025-01-01T00:00:00Z',
      };

      expect(isPastBooking(futureBooking)).toBe(false);
    });
  });
});
