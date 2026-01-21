import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TimeSlot } from '../types';
import { useAppSelector } from '../store';
import {
  generateDoctorSlots,
  formatDateDisplay,
  formatTimeDisplay,
} from '../utils/slotGenerator';
import { DAYS_AHEAD } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorDetail'>;

export default function DoctorDetailScreen({ route, navigation }: Props) {
  const { doctor } = route.params;
  const { bookings } = useAppSelector((state) => state.bookings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    return generateDoctorSlots(doctor, DAYS_AHEAD, bookings);
  }, [doctor, bookings]);

  const availableDates = useMemo(() => {
    return Array.from(slotsByDate.keys()).sort();
  }, [slotsByDate]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return slotsByDate.get(selectedDate) || [];
  }, [selectedDate, slotsByDate]);

  const handleSlotPress = (slot: TimeSlot) => {
    if (!slot.isBooked) {
      navigation.navigate('BookingConfirmation', { slot, doctor });
    }
  };

  const renderDateTab = ({ item: date }: { item: string }) => (
    <TouchableOpacity
      style={[styles.dateTab, selectedDate === date && styles.dateTabSelected]}
      onPress={() => setSelectedDate(date)}
      testID={`date-tab-${date}`}
    >
      <Text
        style={[
          styles.dateTabText,
          selectedDate === date && styles.dateTabTextSelected,
        ]}
      >
        {formatDateDisplay(date)}
      </Text>
    </TouchableOpacity>
  );

  const renderSlot = ({ item: slot }: { item: TimeSlot }) => (
    <TouchableOpacity
      style={[styles.slotButton, slot.isBooked && styles.slotButtonBooked]}
      onPress={() => handleSlotPress(slot)}
      disabled={slot.isBooked}
      testID={`slot-${slot.id}`}
    >
      <Text style={[styles.slotTime, slot.isBooked && styles.slotTimeBooked]}>
        {formatTimeDisplay(slot.startTime)}
      </Text>
      <Text style={[styles.slotDuration, slot.isBooked && styles.slotDurationBooked]}>
        30 min
      </Text>
      {slot.isBooked && <Text style={styles.bookedLabel}>Booked</Text>}
    </TouchableOpacity>
  );

  if (availableDates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorTimezone}>{doctor.timezone}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No available slots in the next {DAYS_AHEAD} days
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorTimezone}>{doctor.timezone}</Text>
      </View>

      <View style={styles.dateTabsContainer}>
        <FlatList
          horizontal
          data={availableDates}
          renderItem={renderDateTab}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateTabsList}
          testID="date-tabs"
        />
      </View>

      <View style={styles.slotsContainer}>
        <Text style={styles.slotsTitle}>Available Time Slots</Text>
        {slotsForSelectedDate.length > 0 ? (
          <FlatList
            data={slotsForSelectedDate}
            renderItem={renderSlot}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.slotsRow}
            contentContainerStyle={styles.slotsList}
            testID="slots-list"
          />
        ) : (
          <Text style={styles.noSlotsText}>No slots available for this date</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  doctorTimezone: {
    fontSize: 14,
    color: '#666666',
  },
  dateTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dateTabsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  dateTabSelected: {
    backgroundColor: '#007AFF',
  },
  dateTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  dateTabTextSelected: {
    color: '#FFFFFF',
  },
  slotsContainer: {
    flex: 1,
    padding: 16,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  slotsList: {
    paddingBottom: 20,
  },
  slotsRow: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  slotButton: {
    flex: 1,
    maxWidth: '31%',
    marginHorizontal: '1%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  slotButtonBooked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  slotTimeBooked: {
    color: '#999999',
  },
  slotDuration: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  slotDurationBooked: {
    color: '#999999',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#FF3B30',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
});
