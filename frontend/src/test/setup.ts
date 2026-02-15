import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Use require to ensure these are polyfilled before any other imports
const { File, Blob } = require('buffer');
global.File = File;
global.Blob = Blob;

const { fetch, Headers, Request, Response } = require('undici');
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn(),
  };
})();
global.localStorage = localStorageMock as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});
