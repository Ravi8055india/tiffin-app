const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isLocal ? 'http://localhost:5000' : '');
