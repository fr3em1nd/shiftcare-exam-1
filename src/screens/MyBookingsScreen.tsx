import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Booking } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { cancelBooking } from '../store/bookingsSlice';
import { formatDateDisplay, formatTimeDisplay } from '../utils/slotGenerator';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

export default function MyBookingsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.bookings);

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${booking.doctorName} on ${formatDateDisplay(booking.date)} at ${formatTimeDisplay(booking.startTime)}?`,
      [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: () => {
            dispatch(cancelBooking(booking.id));
          },
        },
      ]
    );
  };

  const isPastBooking = (booking: Booking): boolean => {
    const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
    return bookingDate < new Date();
  };

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const isPast = isPastBooking(booking);

    return (
      <View
        style={[styles.bookingCard, isPast && styles.bookingCardPast]}
        testID={`booking-${booking.id}`}
      >
        <View style={styles.bookingInfo}>
          <Text style={[styles.doctorName, isPast && styles.textPast]}>
            {booking.doctorName}
          </Text>
          <Text style={[styles.bookingDate, isPast && styles.textPast]}>
            {formatDateDisplay(booking.date)}
          </Text>
          <Text style={[styles.bookingTime, isPast && styles.textPast]}>
            {formatTimeDisplay(booking.startTime)} - {formatTimeDisplay(booking.endTime)}
          </Text>
          <Text style={[styles.bookingTimezone, isPast && styles.textPast]}>
            {booking.doctorTimezone}
          </Text>
          {isPast && <Text style={styles.pastLabel}>Past Appointment</Text>}
        </View>

        {!isPast && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(booking)}
            testID={`cancel-booking-${booking.id}`}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {sortedBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your booked appointments will appear here
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('DoctorsList')}
            testID="browse-doctors-button"
          >
            <Text style={styles.browseButtonText}>Browse Doctors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedBookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="bookings-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  bookingCardPast: {
    borderLeftColor: '#CCCCCC',
    opacity: 0.8,
  },
  bookingInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  bookingTime: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  bookingTimezone: {
    fontSize: 12,
    color: '#999999',
  },
  textPast: {
    color: '#999999',
  },
  pastLabel: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
