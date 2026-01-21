import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Doctor, DoctorSchedule } from '../types';
import { createDoctorId } from '../utils/slotGenerator';
import { API_URL } from '../constants';

interface DoctorsState {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  doctors: [],
  isLoading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DoctorSchedule[] = await response.json();

      const doctorMap = new Map<string, Doctor>();

      for (const schedule of data) {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch doctors';
      return rejectWithValue(message);
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default doctorsSlice.reducer;
