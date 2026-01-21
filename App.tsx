import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store, useAppDispatch } from './src/store';
import { loadBookings } from './src/store/bookingsSlice';
import {
  DoctorsListScreen,
  DoctorDetailScreen,
  BookingConfirmationScreen,
  MyBookingsScreen,
} from './src/screens';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadBookings());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="DoctorsList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="DoctorsList"
          component={DoctorsListScreen}
          options={{ title: 'Find a Doctor' }}
        />
        <Stack.Screen
          name="DoctorDetail"
          component={DoctorDetailScreen}
          options={{ title: 'Available Slots' }}
        />
        <Stack.Screen
          name="BookingConfirmation"
          component={BookingConfirmationScreen}
          options={{ title: 'Confirm Booking' }}
        />
        <Stack.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{ title: 'My Bookings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
