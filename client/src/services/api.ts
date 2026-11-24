import axios from 'axios';

// Use relative URL by default so requests always hit the current host (works on Phone & Laptop identically).
// If a separate backend URL is provided via VITE_API_URL, use that.
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
