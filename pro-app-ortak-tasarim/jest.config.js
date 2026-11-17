// Jest ayarı: jest-expo ön ayarı ve AsyncStorage sahte (mock) modülü.
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['@react-native-async-storage/async-storage/jest/async-storage-mock'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
