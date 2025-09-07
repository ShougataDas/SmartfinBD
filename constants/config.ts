// Configuration for different environments
export const API_CONFIG = {
  BASE_URL: "https://smart-fin-bd-backend.vercel.app", // Production API URL

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
      PREDICT: "/api/v1/financial-profile/predict",
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
    CHAT: {
      SEND: "/api/v1/chat",
    },
  },

  TIMEOUT: 10000, // 10 seconds
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
