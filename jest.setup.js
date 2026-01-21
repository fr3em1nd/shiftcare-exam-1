// Mock expo modules that cause issues in test environment
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Global fetch mock
global.fetch = jest.fn();
