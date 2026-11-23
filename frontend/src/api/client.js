/**
 * Centralized API client for ApplyPilot backend.
 * Uses VITE_API_BASE_URL with fallback to http://127.0.0.1:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { ...options.headers };

  // Don't set Content-Type for FormData (let browser set boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle responses that might not have JSON bodies or return HTML (like demo forms)
    const contentType = response.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `Request failed (HTTP ${response.status})`;
      if (typeof body === 'object' && body !== null) {
        if (Array.isArray(body.detail)) {
          errorMessage = body.detail.map(item => item.msg || JSON.stringify(item)).join('; ');
        } else if (body.detail) {
          errorMessage = body.detail;
        }
      } else if (typeof body === 'string' && body.trim()) {
        errorMessage = body;
      }
      throw new ApiError(errorMessage, response.status, body);
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors (backend not reachable)
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure uvicorn is running.`,
      0,
      error
    );
  }
}

export const api = {
  // Resume upload & parsing
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Opportunities
  async getOpportunities() {
    return request('/api/opportunities', { method: 'GET' });
  },

  async getMatches(profileId) {
    if (!profileId) return [];
    return request(`/api/opportunities/matches?profile_id=${profileId}`, { method: 'GET' });
  },

  async checkEligibility(opportunityId, profileId) {
    return request(
      `/api/opportunities/${encodeURIComponent(opportunityId)}/eligibility?profile_id=${profileId}`,
      { method: 'GET' }
    );
  },

  // Applications
  async getApplications(profileId) {
    if (!profileId) return [];
    return request(`/api/applications?profile_id=${profileId}`, { method: 'GET' });
  },

  async createApplication(profileId, opportunityId) {
    return request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, opportunity_id: opportunityId }),
    });
  },

  async prepareDemo(applicationId) {
    return request(`/api/applications/${applicationId}/demo/prepare`, {
      method: 'POST',
    });
  },

  // Direct demo form submission endpoint
  async submitDemo(applicationId, formDataPayload) {
    const formParams = new URLSearchParams();
    for (const [key, value] of Object.entries(formDataPayload)) {
      formParams.append(key, value ?? '');
    }
    return request(`/demo/applications/${applicationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    });
  },

  getApiBaseUrl() {
    return API_BASE_URL;
  }
};
