import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileHeader({ profile, isEditing, handleFileChange, uploading, onEditClick, onCancelClick, onSaveClick }) {
    const router = useRouter();
    const isAgent = ['agent', 'electrician', 'mechanic'].includes(profile.role);
    
    // Determine display role
    const getDisplayRole = () => {
        if (!isAgent) return 'User';
        if (profile.role === 'electrician') return 'Electrician';
        if (profile.role === 'mechanic') return 'Mechanic';
        return 'Service Agent';
    };

    // Theme Configuration
    const theme = isAgent ? {
        gradient: "from-slate-800 to-gray-900",
        badge: "bg-purple-500/20 text-purple-100 border-purple-500/30",
        verified: "text-purple-400"
    } : {
        gradient: "from-blue-600 to-cyan-500",
        badge: "bg-white/20 text-white border-white/20",
        verified: "text-blue-500"
    };

    return (
        <div className="relative">
            {/* Header Background */}
            <div className={`bg-gradient-to-r ${theme.gradient} h-32 md:h-48 relative z-0 transition-all duration-300`}>
                <button 
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-20 bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm transition flex items-center gap-1 border border-white/10"
                >
                    <span>←</span> Back
                </button>
                
                {/* Role Badge (Top Right) */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {isAgent && profile.isEmergencyAvailable && (
                        <span className="backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border bg-red-500/20 text-red-100 border-red-500/30 flex items-center gap-1">
                            🚨 Emergency
                        </span>
                    )}
                    <span className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${theme.badge}`}>
                        {getDisplayRole()}
                    </span>
                </div>

                {/* Avatar Container */}
                <div className="absolute -bottom-12 left-6 md:left-10 z-10">
                    <div className="relative group">
                        <img 
                            src={profile.profilePhoto || `https://ui-avatars.com/api/?name=${profile.name}&background=random`} 
                            alt="Profile" 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                        />
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition border border-gray-100 group-hover:scale-105 transform">
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                <Camera className="w-4 h-4" />
                            </label>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                                Uploading...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="px-6 md:px-10 pb-4 pt-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {profile.name}
                            {isAgent && profile.verificationStatus === 'verified' && (
                                <span className={theme.verified} title="Verified Agent">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <span>{profile.email}</span>
                            <span>•</span>
                            <span>{profile.phone}</span>
                        </p>
                        
                        <div className="flex gap-2 mt-3">
                             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {profile.status}
                             </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                       {!isEditing ? (
                         <button 
                           onClick={onEditClick}
                           className={`flex-1 md:flex-none text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm ${isAgent ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'}`}
                         >
                           Edit Profile
                         </button>
                       ) : (
                         <div className="flex gap-2 w-full md:w-auto">
                            <button 
                              onClick={onCancelClick}
                              className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={onSaveClick}
                              className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                            >
                              Save Changes
                            </button>
                         </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
}
