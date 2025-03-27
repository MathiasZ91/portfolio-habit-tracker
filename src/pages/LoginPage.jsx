import { useProfile } from '../context/ProfileContext';
import Button from '../components/common/Button';

function LoginPage() {
  const { activeProfile, toggleProfileModal } = useProfile();

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Profile Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeProfile ? (
          <div className="text-center">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
                {activeProfile.imageUrl ? (
                  <img 
                    src={activeProfile.imageUrl} 
                    alt={activeProfile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-2xl">
                    {activeProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold">{activeProfile.name}</h2>
              <p className="text-sm text-gray-500">
                Current streak: {activeProfile.streaks.current} days
              </p>
              <p className="text-sm text-gray-500">
                Best streak: {activeProfile.streaks.best} days
              </p>
            </div>
            
            <Button
              onClick={toggleProfileModal}
              className="w-full"
            >
              Switch or Manage Profiles
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">You don&apos;t have any profiles yet. Create your first profile to get started!</p>
            <Button
              onClick={toggleProfileModal}
              className="w-full"
            >
              Create Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;