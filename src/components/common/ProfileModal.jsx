import { useState, useRef } from 'react';
import { useProfile } from '../../context/ProfileContext';
import Button from './Button';

const ProfileModal = () => {
  const { 
    profiles, 
    activeProfile, 
    isProfileModalOpen, 
    toggleProfileModal,
    createProfile,
    switchProfile,
    deleteProfile 
  } = useProfile();

  const [newProfileName, setNewProfileName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [view, setView] = useState('select'); // 'select', 'create', 'confirm-delete'
  const fileInputRef = useRef(null);

  // Handler for profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create new profile
  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim(), selectedImage);
      resetForm();
      toggleProfileModal();
    }
  };

  // Switch to selected profile
  const handleSwitchProfile = () => {
    if (selectedProfileId) {
      switchProfile(selectedProfileId);
      toggleProfileModal();
    }
  };

  // Delete selected profile
  const handleDeleteProfile = () => {
    if (selectedProfileId) {
      deleteProfile(selectedProfileId);
      setSelectedProfileId(null);
      setView('select');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setNewProfileName('');
    setSelectedImage(null);
    setSelectedProfileId(null);
    setView('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If modal is not open, don't render anything
  if (!isProfileModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button 
            onClick={toggleProfileModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {view === 'select' && (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Profile Management</h2>
              
              {/* Profile Selection */}
              {profiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Select Profile</h3>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {profiles.map(profile => (
                      <div 
                        key={profile.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          activeProfile?.id === profile.id 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProfileId(profile.id)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                          {profile.imageUrl ? (
                            <img 
                              src={profile.imageUrl} 
                              alt={profile.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-xs text-gray-500">
                            Streak: {profile.streaks.current} days (Best: {profile.streaks.best})
                          </div>
                        </div>
                        {activeProfile?.id === profile.id && (
                          <span className="text-blue-500 text-sm">Active</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSwitchProfile}
                      disabled={!selectedProfileId || selectedProfileId === activeProfile?.id}
                      className="flex-1"
                    >
                      Switch Profile
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedProfileId && profiles.length > 1) {
                          setView('confirm-delete');
                        }
                      }}
                      disabled={!selectedProfileId || profiles.length <= 1}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Create New Profile Button */}
              <Button
                onClick={() => setView('create')}
                className="w-full mt-4"
              >
                Create New Profile
              </Button>
            </div>
          )}

          {view === 'create' && (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Create Profile</h2>
              
              {/* Profile Image Selection */}
              <div className="mb-4 flex flex-col items-center">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2 flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Add Photo</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button 
                  className="text-sm text-blue-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Image
                </button>
              </div>
              
              {/* Profile Name Input */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Profile Name</label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter profile name"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setView('select');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {view === 'confirm-delete' && (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Delete Profile</h2>
              <p className="mb-4">
                Are you sure you want to delete this profile? This action cannot be undone.
              </p>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleDeleteProfile}
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setView('select')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;