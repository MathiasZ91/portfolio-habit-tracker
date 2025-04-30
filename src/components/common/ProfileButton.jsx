import { useProfile } from '../../context/ProfileContext';

const ProfileButton = () => {
 const { activeProfile, toggleProfileModal } = useProfile();

 if (!activeProfile) {
   return (
     <button
       onClick={toggleProfileModal}
       className="px-4 py-2 bg-blue-500 text-white rounded-lg"
     >
       Create Profile
     </button>
   );
 }

 return (
   <button
     onClick={toggleProfileModal}
     className="flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50"
   >
     <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
       {activeProfile.imageUrl ? (
         <img 
           src={activeProfile.imageUrl} 
           alt={activeProfile.name} 
           className="w-full h-full object-cover"
         />
       ) : (
         <div className="w-full h-full flex items-center justify-center text-gray-600 font-medium">
           {activeProfile.name.charAt(0).toUpperCase()}
         </div>
       )}
     </div>
     <div className="text-sm font-medium">{activeProfile.name}</div>
     <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
       {activeProfile.streaks.current} day{activeProfile.streaks.current !== 1 ? 's' : ''}
     </div>
   </button>
 );
};

export default ProfileButton;