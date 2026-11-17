// Jest kurulumu: AsyncStorage'ı resmi sahte (mock) modülle değiştirir.
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// store.ts yalnız makeMutable kullanır; yerel worklets modülü jest'te yüklenemediği için sade bir sahte modül verilir.
jest.mock('react-native-reanimated', () => ({ makeMutable: (v) => ({ value: v }) }));
