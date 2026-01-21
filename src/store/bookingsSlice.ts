import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, TimeSlot, Doctor } from '../types';
import { BOOKINGS_STORAGE_KEY } from '../constants';

interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
}

const initialState: BookingsState = {
  bookings: [],
  isLoading: false,
};

export const loadBookings = createAsyncThunk(
  'bookings/loadBookings',
  async () => {
    const stored = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Booking[];
    }
    return [];
  }
);

export const addBooking = createAsyncThunk(
  'bookings/addBooking',
  async (
    { slot, doctor }: { slot: TimeSlot; doctor: Doctor },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { bookings: BookingsState };
    const { bookings } = state.bookings;

    const isAlreadyBooked = bookings.some(
      (b) =>
        b.doctorId === slot.doctorId &&
        b.date === slot.date &&
        b.startTime === slot.startTime
    );

    if (isAlreadyBooked) {
      return rejectWithValue('This slot is already booked');
    }

    const newBooking: Booking = {
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

    const newBookings = [...bookings, newBooking];
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(newBookings));

    return newBooking;
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId: string, { getState }) => {
    const state = getState() as { bookings: BookingsState };
    const newBookings = state.bookings.bookings.filter((b) => b.id !== bookingId);
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(newBookings));
    return bookingId;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(loadBookings.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.bookings.push(action.payload);
      })
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
      });
  },
});

export default bookingsSlice.reducer;
