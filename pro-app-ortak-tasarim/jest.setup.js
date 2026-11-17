// Jest kurulumu: AsyncStorage'ı resmi sahte (mock) modülle değiştirir.
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
