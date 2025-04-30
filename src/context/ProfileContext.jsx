import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

// Context API for global profile management
export const ProfileContext = createContext(null);

// Create new profile structure
const createEmptyProfile = (name) => ({
  id: Date.now().toString(),
  name,
  createdAt: new Date().toISOString(),
  imageUrl: null, // Data URL for profile image
  streaks: {
    current: 0,
    best: 0,
    lastUpdated: null
  }
});

export const ProfileProvider = ({ children }) => {
  ProfileProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  // Store current profile
  const [activeProfile, setActiveProfile] = useState(null);

  // Store all profiles
  const [profiles, setProfiles] = useState([]);

  // Control profile modal visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const storedProfiles = localStorage.getItem('habitTracker_profiles');
    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles);
      setProfiles(parsedProfiles);

      // Set active profile
      const activeProfileId = localStorage.getItem('habitTracker_activeProfile');
      if (activeProfileId) {
        const foundProfile = parsedProfiles.find(p => p.id === activeProfileId);
        if (foundProfile) {
          setActiveProfile(foundProfile);
        } else if (parsedProfiles.length > 0) {
          // Fallback to first profile
          setActiveProfile(parsedProfiles[0]);
          localStorage.setItem('habitTracker_activeProfile', parsedProfiles[0].id);
        }
      } else if (parsedProfiles.length > 0) {
        // Default to first profile
        setActiveProfile(parsedProfiles[0]);
        localStorage.setItem('habitTracker_activeProfile', parsedProfiles[0].id);
      }
    }
  }, []);

  // Save profiles on change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('habitTracker_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Create new profile
  const createProfile = (name, imageDataUrl = null) => {
    const newProfile = createEmptyProfile(name);
    if (imageDataUrl) {
      newProfile.imageUrl = imageDataUrl;
    }

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);

    // Set as active if first profile
    if (updatedProfiles.length === 1) {
      setActiveProfile(newProfile);
      localStorage.setItem('habitTracker_activeProfile', newProfile.id);
    }

    return newProfile;
  };

  // Switch active profile
  const switchProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem('habitTracker_activeProfile', profileId);
    }
  };

  // Update profile data
  const updateProfile = (profileId, updates) => {
    const updatedProfiles = profiles.map(profile =>
      profile.id === profileId ? { ...profile, ...updates } : profile
    );

    setProfiles(updatedProfiles);

    // Update active profile if modified
    if (activeProfile && activeProfile.id === profileId) {
      const updatedActiveProfile = { ...activeProfile, ...updates };
      setActiveProfile(updatedActiveProfile);
    }
  };

  // Remove profile
  const deleteProfile = (profileId) => {
    const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
    setProfiles(updatedProfiles);

    // Handle active profile deletion
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

  // Update streak counter
  const updateStreak = (increment = true) => {
    if (!activeProfile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastUpdated = activeProfile.streaks.lastUpdated;

    // Once per day limit
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

  // Context value with data and functions
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

// Custom hook for accessing profile data
export const useProfile = () => {
  return useContext(ProfileContext);
};