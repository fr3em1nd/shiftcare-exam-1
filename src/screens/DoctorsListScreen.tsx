import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Doctor } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDoctors } from '../store/doctorsSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorsList'>;

export default function DoctorsListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { doctors, isLoading, error } = useAppSelector((state) => state.doctors);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDoctors());
  };

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorDetail', { doctor: item })}
      testID={`doctor-card-${item.id}`}
    >
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorTimezone}>{item.timezone}</Text>
        <Text style={styles.doctorSchedule}>
          {item.schedules.length} day{item.schedules.length !== 1 ? 's' : ''} available
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && doctors.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" testID="loading-indicator" />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText} testID="error-message">
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No doctors available</Text>
          </View>
        }
        testID="doctors-list"
      />
      <TouchableOpacity
        style={styles.bookingsButton}
        onPress={() => navigation.navigate('MyBookings')}
        testID="my-bookings-button"
      >
        <Text style={styles.bookingsButtonText}>My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  doctorCard: {
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
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  doctorTimezone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  doctorSchedule: {
    fontSize: 13,
    color: '#007AFF',
  },
  arrowContainer: {
    paddingLeft: 12,
  },
  arrow: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  bookingsButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bookingsButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
