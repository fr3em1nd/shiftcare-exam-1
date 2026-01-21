# ShiftCare Technical Challenge Mobile

## Description

You are tasked with building a **React Native application** for scheduling appointments. The app should allow users to browse doctors, view their available 30-minute appointment slots, and book appointments.

You are provided with an API that contains a dataset of active doctors and their weekly schedules:

**API:** <https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json>

---

## User Stories

- As a User, I want to see which doctors I can schedule with.
- As a User, I want to see what 30-minute time slots are available to schedule with a particular doctor.
- As a User, I want to book an appointment with a doctor at one of their available times.

---

## ✅ Requirements & Guidelines

### 📄 README.md File

A comprehensive `README.md` must be included and should cover:

- **Setup & Usage Instructions:** How to install, run, and use the application.
- **Assumptions & Design Decisions:** Outline any assumptions made and key decisions during development.
- **Known Limitations & Future Enhancements:** Clearly state any current limitations and potential areas for improvement.

### 🧪 Testing

Your solution must include **automated tests**, covering:

- **Edge Cases:** Handle unexpected or boundary scenarios.
- **Negative Cases:** Go beyond the happy path to ensure robustness.

### 🛠 Technical Requirements

- Use **React Native** (latest stable version or RN ≥ 0.70).
- **Expo** is allowed.
- Implement navigation with **React Navigation**.
- Persist booked appointments using **AsyncStorage**.
- Optional: Use **Redux Toolkit** or **React Context** for state management.
- Use **TypeScript** (recommended) for type safety, but JavaScript is acceptable if justified.

### 🎨 User Interface

The UI/UX should be **clean, intuitive, and mobile-friendly**.

**Minimum screens:**

1. **Home / Doctors List** – displays all active doctors.
2. **Doctor Detail / Availability** – displays weekly schedule with 30-minute slots.
3. **Booking Confirmation** – confirm the appointment details and persist the booking.
4. **My Bookings** – list of booked appointments with the ability to cancel.

Include **loading and error states** for API/network interactions.

### ⏱ Slots & Booking Rules

- Each doctor's schedule describes available windows (days + start/end times). Convert these into **30-minute slots**.
- Booked slots should be **persisted** and **unavailable** in the UI.
- Avoid double-booking the same doctor/time combination.
- Document any **time zone assumptions**.

---

## 🌟 Bonus Points

- Use **Redux Toolkit** for state management.
- Calendar-style UI for days and slot selection.
- Offline-first behavior (queue bookings offline).

---

## 🧠 Considerations & Trade-offs

We understand time is limited, so please:

- Be thoughtful about **scope and prioritization**.
- If you had more time, describe:
  - How you would improve the architecture.
  - What features or improvements you'd prioritize next.
- You can assume a non-authenticated experience for simplicity.

---

## 🔒 Important Note

For this challenge, **do not use AI to generate the full implementation**.

The purpose of this task is to evaluate your understanding of React Native, state management, navigation, data handling, and testing.

You *can* use AI tools for learning, reference, or small snippets (e.g., figuring out AsyncStorage usage or date formatting), but the **core app logic, components, and tests must be written by you**.

Any submission that is fully AI-generated may be disqualified.

This ensures that the challenge reflects your **actual coding skills, problem-solving, and design decisions**.
