/**
 * Switch the API host by changing ACTIVE_API_HOST below.
 * - 'localhost' → this PC / emulator loopback
 * - 'pc'        → this PC's LAN IP (phones on the same Wi-Fi)
 */
export const API_HOSTS = {
  localhost: {
    host: 'localhost',
    port: 5000,
    baseUrl: 'http://localhost:5000/api',
  },
  pc: {
    host: '192.168.18.90',
    port: 5000,
    baseUrl: 'http://192.168.18.90:5000/api',
  },
} as const;

/** Change this value to 'localhost' or 'pc' */
export const ACTIVE_API_HOST: keyof typeof API_HOSTS = 'pc';

export const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return 'https://api.coretech-enterprise.com/api/v1';
  }
  return API_HOSTS[ACTIVE_API_HOST].baseUrl;
};
