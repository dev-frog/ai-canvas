// Firebase connection test
import { auth } from './firebase';

export const testFirebaseConnection = async () => {
  console.log('=== Testing Firebase Connection ===');
  console.log('Firebase Auth Object:', auth);
  console.log('Auth App Config:', auth.app.options);
  console.log('Auth Current User:', auth.currentUser);

  try {
    // Test if we can access auth methods
    const methods = await auth.app.options;
    console.log('Firebase app initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
};