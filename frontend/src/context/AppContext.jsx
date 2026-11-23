import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PROFILE: 'applypilot_profile',
  PREFERENCES: 'applypilot_preferences',
  RECENT_ACTIVITY: 'applypilot_recent_activity',
};

export function AppProvider({ children }) {
  // Profile state
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User preferences (job categories, locations, alerts)
  const [preferences, setPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return saved ? JSON.parse(saved) : {
        preferredCategories: ['Backend', 'Frontend', 'Data Analysis', 'Machine Learning', 'Cloud'],
        preferredLocations: ['Remote (India)', 'Bengaluru', 'Pune', 'Hyderabad', 'Mumbai'],
        remoteOnly: false,
        minMatchScore: 40,
        emailNotifications: true,
        autoScanDeadlines: true,
      };
    } catch {
      return {
        preferredCategories: ['Backend', 'Frontend'],
        preferredLocations: ['Remote (India)'],
        remoteOnly: false,
        minMatchScore: 40,
        emailNotifications: true,
        autoScanDeadlines: true,
      };
    }
  });

  // Opportunities and matches
  const [opportunities, setOpportunities] = useState([]);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // Active application selected for autofill / assistant flow
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // Loading & error states
  const [loading, setLoading] = useState({
    opportunities: false,
    matches: false,
    applications: false,
    resume: false,
  });
  const [error, setError] = useState(null);

  // Toast notifications
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Update profile and persist
  const setProfile = useCallback((newProfile) => {
    setProfileState(newProfile);
    if (newProfile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }
  }, []);

  // Update preferences and persist
  const updatePreferences = useCallback((newPrefs) => {
    setPreferencesState(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      return updated;
    });
    addNotification('success', 'Preferences updated successfully.');
  }, [addNotification]);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(prev => ({ ...prev, opportunities: true }));
    try {
      const list = await api.getOpportunities();
      setOpportunities(list);
      return list;
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      // Don't show toast immediately on boot if offline, but store error
      return [];
    } finally {
      setLoading(prev => ({ ...prev, opportunities: false }));
    }
  }, []);

  // Fetch matches when profile is available
  const fetchMatches = useCallback(async (profileId) => {
    if (!profileId) {
      setMatches([]);
      return [];
    }
    setLoading(prev => ({ ...prev, matches: true }));
    try {
      const matched = await api.getMatches(profileId);
      setMatches(matched);
      return matched;
    } catch (err) {
      console.error('Failed to load matches:', err);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, matches: false }));
    }
  }, []);

  // Fetch applications for profile
  const fetchApplications = useCallback(async (profileId) => {
    if (!profileId) {
      setApplications([]);
      return [];
    }
    setLoading(prev => ({ ...prev, applications: true }));
    try {
      const apps = await api.getApplications(profileId);
      setApplications(apps);
      return apps;
    } catch (err) {
      console.error('Failed to load applications:', err);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await fetchOpportunities();
    if (profile?.profile_id) {
      await Promise.all([
        fetchMatches(profile.profile_id),
        fetchApplications(profile.profile_id),
      ]);
    }
  }, [fetchOpportunities, fetchMatches, fetchApplications, profile?.profile_id]);

  // Initial load
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // When profile changes, refresh matches & applications
  useEffect(() => {
    if (profile?.profile_id) {
      fetchMatches(profile.profile_id);
      fetchApplications(profile.profile_id);
    } else {
      setMatches([]);
      setApplications([]);
    }
  }, [profile?.profile_id, fetchMatches, fetchApplications]);

  // Create an application
  const applyToOpportunity = useCallback(async (opportunityId) => {
    if (!profile?.profile_id) {
      addNotification('error', 'Please upload or set up your profile first.');
      return null;
    }

    try {
      const created = await api.createApplication(profile.profile_id, opportunityId);
      addNotification('success', 'Application draft created!');
      await fetchApplications(profile.profile_id);
      setSelectedApplicationId(created.id);
      return created;
    } catch (err) {
      if (err.status === 409) {
        // Already exists, fetch and select it
        const apps = await fetchApplications(profile.profile_id);
        const existing = apps.find(a => a.opportunity_id === opportunityId);
        if (existing) {
          setSelectedApplicationId(existing.id);
          addNotification('info', 'Opened existing application draft.');
          return existing;
        }
      }
      addNotification('error', err.message || 'Failed to apply.');
      throw err;
    }
  }, [profile?.profile_id, fetchApplications, addNotification]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        preferences,
        updatePreferences,
        opportunities,
        matches,
        applications,
        selectedApplicationId,
        setSelectedApplicationId,
        loading,
        error,
        notifications,
        addNotification,
        removeNotification,
        fetchOpportunities,
        fetchMatches,
        fetchApplications,
        refreshAll,
        applyToOpportunity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
