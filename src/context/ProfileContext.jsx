import React, { createContext, useContext, useState, useEffect } from 'react';

/* KEY CONCEPT: CONTEXT API FOR GLOBAL PROFILE MANAGEMENT */
const ProfileContext = createContext(null);

// Custom hook for easy access to profile data
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Helper function to create a new profile structure
const createEmptyProfile = (name) => ({
  id: Date.now().toString(),
  name,
  createdAt: new Date().toISOString(),
  imageUrl: null, // Will store the Data URL of the profile image
  streaks: {
    current: 0,
    best: 0,
    lastUpdated: null
  }
});

// Provider component that makes profile data available throughout the app
export const ProfileProvider = ({ children }) => {
  // State to store the currently active profile
  const [activeProfile, setActiveProfile] = useState(null);
  
  // State to store all available profiles
  const [profiles, setProfiles] = useState([]);
  
  // State to control profile modal visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load profiles from localStorage on component mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem('habitTracker_profiles');
    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles);
      setProfiles(parsedProfiles);
      
      // Load active profile if one exists
      const activeProfileId = localStorage.getItem('habitTracker_activeProfile');
      if (activeProfileId) {
        const foundProfile = parsedProfiles.find(p => p.id === activeProfileId);
        if (foundProfile) {
          setActiveProfile(foundProfile);
        } else if (parsedProfiles.length > 0) {
          // Fallback to first profile if active not found
          setActiveProfile(parsedProfiles[0]);
          localStorage.setItem('habitTracker_activeProfile', parsedProfiles[0].id);
        }
      } else if (parsedProfiles.length > 0) {
        // Set first profile as active if none selected
        setActiveProfile(parsedProfiles[0]);
        localStorage.setItem('habitTracker_activeProfile', parsedProfiles[0].id);
      }
    }
  }, []);

  // Save profiles whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('habitTracker_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Create a new profile
  const createProfile = (name, imageDataUrl = null) => {
    const newProfile = createEmptyProfile(name);
    if (imageDataUrl) {
      newProfile.imageUrl = imageDataUrl;
    }
    
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    
    // If this is the first profile, set it as active
    if (updatedProfiles.length === 1) {
      setActiveProfile(newProfile);
      localStorage.setItem('habitTracker_activeProfile', newProfile.id);
    }
    
    return newProfile;
  };

  // Switch to a different profile
  const switchProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem('habitTracker_activeProfile', profileId);
    }
  };

  // Update a profile
  const updateProfile = (profileId, updates) => {
    const updatedProfiles = profiles.map(profile => 
      profile.id === profileId ? { ...profile, ...updates } : profile
    );
    
    setProfiles(updatedProfiles);
    
    // Update active profile if it was the one modified
    if (activeProfile && activeProfile.id === profileId) {
      const updatedActiveProfile = { ...activeProfile, ...updates };
      setActiveProfile(updatedActiveProfile);
    }
  };

  // Delete a profile
  const deleteProfile = (profileId) => {
    const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
    setProfiles(updatedProfiles);
    
    // If we deleted the active profile, switch to another one
    if (activeProfile && activeProfile.id === profileId) {
      if (updatedProfiles.length > 0) {
        setActiveProfile(updatedProfiles[0]);
        localStorage.setItem('habitTracker_activeProfile', updatedProfiles[0].id);
      } else {
        setActiveProfile(null);
        localStorage.removeItem('habitTracker_activeProfile');
      }
    }
  };

  // Update streaks for the active profile
  const updateStreak = (increment = true) => {
    if (!activeProfile) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastUpdated = activeProfile.streaks.lastUpdated;
    
    // Only update once per day
    if (lastUpdated === today) return;
    
    let current = activeProfile.streaks.current;
    let best = activeProfile.streaks.best;
    
    if (increment) {
      current += 1;
      if (current > best) {
        best = current;
      }
    } else {
      current = 0;
    }
    
    const updatedStreaks = {
      current,
      best,
      lastUpdated: today
    };
    
    updateProfile(activeProfile.id, { streaks: updatedStreaks });
  };

  // Toggle modal visibility
  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  // Value object with all the data and functions we want to provide
  const value = {
    activeProfile,
    profiles,
    isProfileModalOpen,
    createProfile,
    switchProfile,
    updateProfile,
    deleteProfile,
    updateStreak,
    toggleProfileModal
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};