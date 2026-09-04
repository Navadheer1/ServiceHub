'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

// Components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import Field from '../../components/profile/Field';
import AgentStats from '../../components/profile/AgentStats';
import SkillsSection from '../../components/profile/SkillsSection';
import AvailabilityView from '../../components/profile/AvailabilityView';
import UserBookings from '../../components/profile/UserBookings';
import SavedAddresses from '../../components/profile/SavedAddresses';

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
        fetchProfile();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response && error.response.status === 404) {
          alert('Profile not found in database. Please login again.');
          logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: type === 'checkbox' ? checked : value
            }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }
  };

  const handleArrayChange = (e, field) => {
      const values = e.target.value.split(',').map(item => item.trim());
      setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, profilePhoto: data.url }));
      // Update the profile photo immediately on the server
      await api.put('/profile', { profilePhoto: data.url }); 
      setProfile(prev => ({ ...prev, profilePhoto: data.url }));
      
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/profile', formData);
      setProfile(data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!profile) return <div className="p-10 text-center">Profile not found</div>;

  const isAgent = profile.role === 'agent';

  // Render Content based on Role and Tab
  const renderTabContent = () => {
    switch (activeTab) {
        case 'overview':
            return (
                <div className="space-y-6">
                    {/* Completion Status */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Profile Completion</h3>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                            <div className={`h-2.5 rounded-full ${isAgent ? 'bg-indigo-600' : 'bg-blue-600'}`} style={{ width: `${profile.profileCompletion || 0}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-500">{profile.profileCompletion || 0}% Completed</p>
                    </div>

                    {isAgent && <AgentStats profile={profile} />}

                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Full Name" name="name" value={formData.name} onChange={handleInputChange} isEditing={isEditing} />
                            <Field label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} isEditing={isEditing} />
                            <Field label="Address" name="address" value={formData.address} onChange={handleInputChange} isEditing={isEditing} />
                            <Field label="Language" name="language" value={formData.language} onChange={handleInputChange} isEditing={isEditing} />
                        </div>
                    </section>

                    {!isAgent && <SavedAddresses addresses={formData.savedAddresses} isEditing={isEditing} />}
                </div>
            );
        
        case 'skills':
            return isAgent ? (
                <SkillsSection 
                    formData={formData} 
                    handleArrayChange={handleArrayChange} 
                    handleInputChange={handleInputChange} 
                    isEditing={isEditing} 
                />
            ) : null;

        case 'availability':
            return isAgent ? (
                <AvailabilityView 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    isEditing={isEditing} 
                />
            ) : null;
            
        case 'earnings':
             return isAgent ? (
                 <div className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm text-center">
                     <h3 className="text-xl font-bold text-gray-900 mb-2">Earnings Dashboard</h3>
                     <p className="text-gray-500">Detailed earnings analytics coming soon.</p>
                 </div>
             ) : null;

        case 'bookings':
            return !isAgent ? <UserBookings /> : null;

        case 'settings':
            return (
                 <div className="space-y-6">
                     <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Privacy & Security</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Show Phone Number</p>
                                    <p className="text-sm text-gray-500">Allow users to see your phone number</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="privacy.showPhone" 
                                    checked={formData.privacy?.showPhone} 
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showPhone: e.target.checked }
                                        }));
                                    }}
                                    disabled={!isEditing}
                                    className="toggle accent-blue-600 w-5 h-5"
                                />
                            </div>
                        </div>
                     </section>
                     
                     <div className="flex justify-end">
                        <button onClick={logout} className="text-red-600 hover:text-red-800 font-medium text-sm px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">
                            Sign Out
                        </button>
                     </div>
                 </div>
            );

        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        
        <ProfileHeader 
            profile={profile} 
            isEditing={isEditing} 
            handleFileChange={handleFileChange} 
            uploading={uploading}
            onEditClick={() => setIsEditing(true)}
            onCancelClick={() => { setIsEditing(false); setFormData(profile); }}
            onSaveClick={handleSubmit}
        />

        <div className="px-6 md:px-10 pb-8">
             <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isAgent={isAgent} />
             
             <div className="mt-8 animate-fadeIn">
                {renderTabContent()}
             </div>
        </div>
      </div>
    </div>
  );
}
