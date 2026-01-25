'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { io } from 'socket.io-client';
import { 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  Camera, 
  Heart, 
  Clock, 
  User, 
  LogOut, 
  Plus, 
  Wrench, 
  Smartphone, 
  Tv, 
  Zap, 
  Truck,
  Search,
  CheckCircle,
  X,
  Star
} from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [favorites, setFavorites] = useState(user?.favoriteAgents || []);
  const [favoriteAgentsList, setFavoriteAgentsList] = useState([]);

  // Mechanic Specific State
  const [bookingMode, setBookingMode] = useState('Scheduled');
  const [vehicleDetails, setVehicleDetails] = useState({
    type: 'Car',
    brand: '',
    model: '',
    fuelType: 'Petrol',
    issueDescription: ''
  });
  const [locationCoords, setLocationCoords] = useState(null);

  // New Request Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Mobile',
    description: '',
    serviceType: 'Home',
    address: user?.address || '',
    scheduledTime: '',
    media: [],
  });
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const categories = [
    { name: 'Mobile', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Laptop', icon: Tv, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'TV', icon: Tv, color: 'text-pink-500', bg: 'bg-pink-100' },
    { name: 'AC', icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    { name: 'Mechanic', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-100' },
    { name: 'Other', icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-100' },
  ];

  const handleToggleFavorite = async (agentId) => {
    try {
      const { data } = await api.put('/auth/favorites', { agentId });
      setFavorites(data);
      const updatedUser = { ...user, favoriteAgents: data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Files = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      })
    );
    setFormData((prev) => ({ ...prev, media: base64Files }));
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchFavorites();

      const newSocket = io(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''));
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_room', user._id);
      });

      newSocket.on('request_status', (data) => {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === data.requestId ? { ...req, status: data.status, agent: data.agent || req.agent } : req
          )
        );
      });

      return () => newSocket.close();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
        const { data } = await api.get('/auth/favorites');
        setFavoriteAgentsList(data);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/my');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (e) => {
    setVehicleDetails({ ...vehicleDetails, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCoords({
            type: 'Point',
            coordinates: [longitude, latitude]
          });
          setFormData((prev) => ({
            ...prev,
            address: `GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          }));
        },
        (error) => {
          console.error('Error getting location:', error.message);
          let errorMessage = 'Unable to retrieve location. ';
          switch(error.code) {
              case 1: errorMessage += 'User denied the request.'; break;
              case 2: errorMessage += 'Location unavailable.'; break;
              case 3: errorMessage += 'Request timed out.'; break;
              default: errorMessage += 'Unknown error.'; break;
          }
          alert(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitStatus(null);
    try {
      const location = locationCoords || { type: 'Point', coordinates: [0, 0] }; 
      const payload = { 
          ...formData, 
          location,
          bookingMode: formData.category === 'Mechanic' ? bookingMode : undefined,
          vehicleDetails: formData.category === 'Mechanic' ? vehicleDetails : undefined
      };

      const { data } = await api.post('/requests', payload);
      setRequests([data, ...requests]);
      setSubmitStatus('success');
      setMessage('Request submitted successfully!');
      
      // Reset form after delay
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitStatus(null);
        setMessage('');
        setFormData({
            category: 'Mobile',
            description: '',
            serviceType: 'Home',
            address: user?.address || '',
            scheduledTime: '',
            media: [],
          });
      }, 2000);

    } catch (error) {
      setSubmitStatus('error');
      setMessage('Error submitting request. Please try again.');
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center bg-gray-50 text-primary">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-gray-900 sm:block">Service Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Welcome, {user.name}</p>
              <p className="text-xs text-gray-500">Member since {new Date().getFullYear()}</p>
            </div>
            <button
              onClick={logout}
              className="group flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Hero / Quick Actions */}
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Relax, help is here.
          </h1>
          <p className="mb-8 text-lg text-gray-500">What service do you need today?</p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setFormData({ ...formData, category: cat.name });
                  if (cat.name === 'Mechanic') setBookingMode('Emergency');
                  setIsFormOpen(true);
                }}
                className={`group relative flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                  formData.category === cat.name ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${cat.bg} ${cat.color} transition-transform group-hover:scale-110`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <span className="font-semibold text-gray-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Area (Recent Requests) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Active Requests</h2>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark active:scale-95"
              >
                <Plus className="h-4 w-4" /> New Request
              </button>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center rounded-2xl bg-white shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                  <Calendar className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">No active requests</h3>
                <p className="text-gray-500">Book your first service above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req._id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${req.category === 'Mechanic' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {req.category === 'Mechanic' ? <Truck className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{req.category} Repair</h3>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{req.description}</p>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {req.address}
                            </div>
                          </div>
                        </div>
                      </div>

                      {req.agent && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 sm:mt-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{req.agent.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>4.8</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleFavorite(req.agent._id)}
                            className={`ml-2 rounded-full p-2 transition-colors ${
                              favorites.includes(req.agent._id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-300 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${favorites.includes(req.agent._id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar (Favorites) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Heart className="h-5 w-5 text-red-500" /> Favorite Pros
              </h2>
              {favoriteAgentsList.length === 0 ? (
                <p className="text-sm text-gray-500">Add agents to your favorites to book them again quickly.</p>
              ) : (
                <div className="space-y-3">
                  {favoriteAgentsList.map((agent) => (
                    <div key={agent._id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.specialization}</p>
                        </div>
                      </div>
                      <button
                         onClick={() => handleToggleFavorite(agent._id)}
                         className="text-red-500 opacity-50 hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-8">
              <h2 className="mb-1 text-2xl font-bold text-gray-900">
                {formData.category === 'Mechanic' && bookingMode === 'Emergency' ? (
                    <span className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-6 w-6"/> Emergency Booking</span>
                ) : 'Book a Service'}
              </h2>
              <p className="mb-6 text-gray-500">Fill in the details and we'll find a pro instantly.</p>

              {submitStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Request Sent!</h3>
                  <p className="text-gray-500">Agents near you are being notified.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category & Mode */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Service Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 font-medium focus:border-primary focus:ring-primary"
                      >
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    {formData.category === 'Mechanic' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                value={bookingMode}
                                onChange={(e) => setBookingMode(e.target.value)}
                                className={`block w-full rounded-xl border-gray-200 p-3 font-medium focus:ring-2 ${bookingMode === 'Emergency' ? 'bg-red-50 text-red-700 ring-red-500' : 'bg-gray-50'}`}
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Emergency">🚨 Emergency (Immediate)</option>
                            </select>
                        </div>
                    )}
                  </div>

                  {/* Mechanic Specifics */}
                  {formData.category === 'Mechanic' && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-800">Vehicle Info</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            name="brand" 
                            placeholder="Vehicle Model (e.g. Honda City)" 
                            value={vehicleDetails.brand} 
                            onChange={handleVehicleChange} 
                            className="rounded-lg border-transparent bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                         <select name="type" value={vehicleDetails.type} onChange={handleVehicleChange} className="rounded-lg border-transparent bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option>Car</option>
                            <option>Bike</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">What's the issue?</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe the problem..."
                      className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-primary focus:ring-primary"
                      required
                    ></textarea>
                  </div>

                  {/* Location & Time */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                      <div className="flex gap-2">
                         <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter address"
                            className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-primary focus:ring-primary"
                            required
                         />
                         <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors hover:bg-green-200"
                            title="Use GPS"
                         >
                            <MapPin className="h-5 w-5" />
                         </button>
                      </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Time</label>
                        <input
                            type="datetime-local"
                            name="scheduledTime"
                            value={formData.scheduledTime}
                            onChange={handleInputChange}
                            className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-primary focus:ring-primary"
                        />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                        formData.category === 'Mechanic' && bookingMode === 'Emergency'
                        ? 'bg-red-600 shadow-red-500/30 hover:bg-red-700'
                        : 'bg-primary shadow-primary/30 hover:bg-primary-dark'
                    }`}
                  >
                    {formData.category === 'Mechanic' && bookingMode === 'Emergency' ? '🚨 REQUEST IMMEDIATE HELP' : 'Book Service'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
