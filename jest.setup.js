import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Freighter wallet
Object.defineProperty(window, 'freighterApi', {
  value: {
    isConnected: jest.fn().mockResolvedValue(true),
    getPublicKey: jest.fn().mockResolvedValue('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V6ST'),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Ensure clipboard API is mocked only once
global.navigator.clipboard = {
  writeText: jest.fn(),
  readText: jest.fn(),
};

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
