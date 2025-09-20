const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// Text Analysis
export const analyzeText = async (text, sender = '') => {
  const response = await fetch(`${API_BASE_URL}/analyze/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, sender }),
  });
  return handleResponse(response);
};

// Image Analysis
export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/analyze/image`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

// Email Analysis
export const analyzeEmail = async (emailData) => {
  const response = await fetch(`${API_BASE_URL}/analyze/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  return handleResponse(response);
};

// URL Analysis
export const analyzeURL = async (url) => {
  const response = await fetch(`${API_BASE_URL}/analyze/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  return handleResponse(response);
};

// Educational Content
export const getEducationalContent = async (topic) => {
  const params = new URLSearchParams();
  if (topic) params.append('topic', topic);

  const response = await fetch(`${API_BASE_URL}/education/content?${params}`);
  return handleResponse(response);
};

// Quiz Questions
export const getQuizQuestions = async (questionId) => {
  const params = new URLSearchParams();
  if (questionId) params.append('question_id', questionId);

  const response = await fetch(`${API_BASE_URL}/education/quiz?${params}`);
  return handleResponse(response);
};

// Safety Report
export const generateSafetyReport = async (analysisResults, userActions = {}) => {
  const response = await fetch(`${API_BASE_URL}/education/safety-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysis_results: analysisResults, user_actions: userActions }),
  });
  return handleResponse(response);
};

// Security Checklist
export const getSecurityChecklist = async () => {
  const response = await fetch(`${API_BASE_URL}/education/security-checklist`);
  return handleResponse(response);
};

// Emergency Contacts
export const getEmergencyContacts = async () => {
  const response = await fetch(`${API_BASE_URL}/education/emergency-contacts`);
  return handleResponse(response);
};

// Health Check
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

// Utility function to convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Utility function to validate file type
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  return validTypes.includes(file.type);
};

// Utility function to validate file size
export const isValidFileSize = (file, maxSizeMB = 16) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  return file.size <= maxSize;
};

// Error handler for network issues
export const handleNetworkError = (error) => {
  console.error('Network error:', error);
  
  if (error.message.includes('Failed to fetch')) {
    return {
      error: 'Unable to connect to the server. Please check your internet connection.',
      type: 'network'
    };
  }
  
  if (error.message.includes('timeout')) {
    return {
      error: 'Request timed out. Please try again.',
      type: 'timeout'
    };
  }
  
  return {
    error: error.message || 'An unexpected error occurred. Please try again.',
    type: 'unknown'
  };
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFunc, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunc();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

export default {
  analyzeText,
  analyzeImage,
  analyzeEmail,
  analyzeURL,
  getEducationalContent,
  getQuizQuestions,
  generateSafetyReport,
  getSecurityChecklist,
  getEmergencyContacts,
  checkHealth,
  fileToBase64,
  isValidImageFile,
  isValidFileSize,
  handleNetworkError,
  retryRequest
};