import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Idempotency-Key for POST requests
apiClient.interceptors.request.use((config) => {
  if (config.method === 'post' && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = uuidv4();
  }
  return config;
});

// Offline queuing system
export const syncOfflineRequests = async () => {
  if (typeof window === 'undefined') return;

  const queueStr = localStorage.getItem('offlineQueue');
  if (!queueStr) return;

  try {
    const queue: any[] = JSON.parse(queueStr);
    if (!Array.isArray(queue) || queue.length === 0) return;

    // Retry requests
    const remainingQueue = [];
    for (const req of queue) {
      try {
        await apiClient.request({
          method: req.method,
          url: req.url,
          data: req.data,
          headers: req.headers,
        });
      } catch (err: any) {
        if (!err.response) {
          // Still offline or network error, keep in queue
          remainingQueue.push(req);
        }
      }
    }

    if (remainingQueue.length > 0) {
      localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));
    } else {
      localStorage.removeItem('offlineQueue');
    }
  } catch (error) {
    console.error('Failed to parse offline queue', error);
  }
};

export const queueOfflineRequest = (config: any) => {
  if (typeof window === 'undefined') return;

  const queueStr = localStorage.getItem('offlineQueue');
  const queue = queueStr ? JSON.parse(queueStr) : [];
  
  queue.push({
    method: config.method,
    url: config.url,
    data: config.data,
    headers: {
      ...config.headers,
      'Idempotency-Key': config.headers['Idempotency-Key'] || uuidv4(),
    },
  });

  localStorage.setItem('offlineQueue', JSON.stringify(queue));
};
