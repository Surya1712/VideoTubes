// Buffer polyfill for browser compatibility
import { Buffer } from "buffer";

// Make Buffer available globally if needed
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

// Make global available if needed
if (typeof window !== "undefined" && !window.global) {
  window.global = window;
}

// Export for explicit imports
export { Buffer };
