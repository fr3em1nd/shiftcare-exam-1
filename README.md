# ShiftCare Appointment Scheduler

A React Native (Expo) application for scheduling doctor appointments with 30-minute time slots.

---

## Setup & Usage Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, comes with npx)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd shiftcare
npm install
```

### Running the App

```bash
npm start
npm run ios
npm run android
npm run web
```

### Running Tests

```bash
npm test
```

---

## Project Structure

```
src/
├── __tests__/
│   ├── slotGenerator.test.ts
│   └── BookingContext.test.tsx
├── store/
│   ├── index.ts
│   ├── doctorsSlice.ts
│   └── bookingsSlice.ts
├── screens/
│   ├── DoctorsListScreen.tsx
│   ├── DoctorDetailScreen.tsx
│   ├── BookingConfirmationScreen.tsx
│   └── MyBookingsScreen.tsx
├── types/
│   └── index.ts
└── utils/
    └── slotGenerator.ts
```

---

## Features

1. **Browse Doctors** - View all available doctors with their timezone and schedule summary
2. **View Availability** - See 30-minute time slots for the next 14 days
3. **Book Appointments** - Select and confirm appointment slots
4. **Manage Bookings** - View and cancel existing appointments
5. **Persistence** - Bookings are saved locally using AsyncStorage

---

## Assumptions & Design Decisions

### Time Zone Handling

- All times displayed are in the doctor's local timezone as provided by the API
- The timezone is displayed on doctor cards and booking confirmations for clarity
- No timezone conversion is performed; users are expected to be aware of the doctor's timezone

### Slot Generation

- Slots are generated dynamically for the next 14 days
- Only complete 30-minute slots are created (no partial slots at end of availability windows)
- Each doctor can have multiple availability windows per day (all are combined)

### Data Persistence

- Bookings are stored in AsyncStorage with the key `@shiftcare_bookings`
- Bookings persist across app restarts
- Past bookings are displayed but cannot be cancelled

### Double-Booking Prevention

- The system checks for existing bookings before allowing a new one
- Validation occurs both when displaying slots and at booking confirmation time
- Race conditions are handled by checking slot availability at the moment of booking

### API Data

- Doctor schedules are fetched fresh on app launch and can be refreshed via pull-to-refresh
- The API response is grouped by doctor name to create unique doctor profiles
- Doctor IDs are generated from names (lowercase, hyphens for spaces/special characters)

---

## Known Limitations

1. No Authentication - The app operates without user accounts; all bookings are local
2. No Backend Sync - Bookings are only stored locally, not synced to a server
3. No Push Notifications - No reminders for upcoming appointments
4. No Offline Queue - Network errors during API fetch prevent displaying doctors
5. Time Zone Display Only - Times are not converted to user's local timezone
6. No Conflict Detection Across Users - Since there's no backend, multiple users could theoretically book the same slot

---

## Future Enhancements

If more time were available, I would prioritize:

### High Priority

1. Backend Integration - Store bookings on a server to enable true double-booking prevention
2. User Authentication - Allow users to sign in and access their bookings across devices
3. Offline-First Architecture - Queue bookings when offline, sync when connected

### Medium Priority

4. Calendar View - Replace date tabs with a proper calendar component
5. Push Notifications - Remind users of upcoming appointments
6. Search/Filter - Filter doctors by name, timezone, or availability

### Architecture Improvements

7. React Query - For better API caching and background refetching
8. Error Boundary - Graceful error handling throughout the app
9. E2E Tests - Add Detox or Maestro tests for full user flow testing

---

## Technical Stack

- Framework: React Native 0.81.5 with Expo SDK 54
- Language: TypeScript
- Navigation: React Navigation (Native Stack)
- State Management: Redux Toolkit
- Persistence: AsyncStorage
- Testing: Jest with ts-jest

---

## Test Coverage

The test suite includes 55 tests covering:

### Slot Generator Tests

- Time parsing (AM/PM, 12-hour format, leading spaces)
- Time formatting (24-hour to display format)
- Slot generation (correct number, timing, boundaries)
- Edge cases (windows < 30 min, exactly 30 min, PM schedules)

### Booking Logic Tests

- Double-booking prevention
- Booking creation and cancellation
- Slot availability checking
- Doctor grouping from API data
- Booking sorting by date/time
- Past booking detection

---

## API Reference

Endpoint: https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json

Response Format:

```json
[
  {
    "name": "Dr. Jane Smith",
    "timezone": "Australia/Sydney",
    "day_of_week": "monday",
    "available_at": " 9:00AM",
    "available_until": "5:00PM"
  }
]
```
