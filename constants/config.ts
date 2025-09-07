// Configuration for different environments
export const API_CONFIG = {
  // For development - you'll need to replace this with your actual IP address
  // To find your IP: On Windows, run `ipconfig` and look for IPv4 Address
  // On Mac/Linux, run `ifconfig` or `ip addr show`
  BASE_URL: __DEV__
    ? "http://192.168.0.107:4000" // Replace with your computer's IP address
    : "https://your-production-api.com", // Replace with your production API URL

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/v1/auth/login",
      REGISTER: "/api/v1/user",
      REFRESH: "/api/v1/auth/refresh",
    },
    USER: {
      PROFILE: "/api/v1/user/my-profile",
      UPDATE: "/api/v1/user/update-profile",
    },
    FINANCIAL_PROFILE: {
      GET: "/api/v1/financial-profile",
      UPDATE: "/api/v1/financial-profile/",
    },
    RISK_ASSESSMENT: {
      GET: "/api/v1/risk-assessment",
      CREATE: "/api/v1/risk-assessment",
      UPDATE: "/api/v1/risk-assessment/",
    },
    INVESTMENT: {
      GET: "/api/v1/investment",
      CREATE: "/api/v1/investment",
      UPDATE: "/api/v1/investment/",
    },
  },

  TIMEOUT: 10000, // 10 seconds
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Network configuration for React Native
export const NETWORK_CONFIG = {
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, use localhost or your computer's IP
  ANDROID_EMULATOR_URL: "http://10.0.2.2:4000",
  IOS_SIMULATOR_URL: "http://localhost:4000",
  PHYSICAL_DEVICE_URL: "http://192.168.0.107:4000", // Replace with your IP
};
