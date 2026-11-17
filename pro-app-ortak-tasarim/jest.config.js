// Jest ayarı: jest-expo ön ayarı ve AsyncStorage sahte (mock) modülü (jest.setup.js içinde kayıtlı).
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
