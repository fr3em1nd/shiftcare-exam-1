import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { addBooking } from '../store/bookingsSlice';
import { formatDateDisplay, formatTimeDisplay } from '../utils/slotGenerator';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen({ route, navigation }: Props) {
  const { slot, doctor } = route.params;
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.bookings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slotStillAvailable = !bookings.some(
    (b) => b.doctorId === slot.doctorId && b.date === slot.date && b.startTime === slot.startTime
  );

  const handleConfirmBooking = async () => {
    if (!slotStillAvailable) {
      Alert.alert(
        'Slot Unavailable',
        'This slot has already been booked. Please select another time.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(addBooking({ slot, doctor })).unwrap();
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment with ${doctor.name} on ${formatDateDisplay(slot.date)} at ${formatTimeDisplay(slot.startTime)} has been confirmed.`,
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              navigation.reset({
                index: 1,
                routes: [{ name: 'DoctorsList' }, { name: 'MyBookings' }],
              });
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.popToTop(),
          },
        ]
      );
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to book appointment';
      Alert.alert('Booking Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirm Your Appointment</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Doctor</Text>
            <Text style={styles.detailValue}>{doctor.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDateDisplay(slot.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>30 minutes</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Timezone</Text>
            <Text style={styles.detailValue}>{doctor.timezone}</Text>
          </View>
        </View>

        {!slotStillAvailable && (
          <View style={styles.unavailableBanner}>
            <Text style={styles.unavailableText}>
              This slot is no longer available
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!slotStillAvailable || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!slotStillAvailable || isSubmitting}
          testID="confirm-button"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  unavailableBanner: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  unavailableText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
