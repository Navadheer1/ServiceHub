'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { io } from 'socket.io-client';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Navigation, 
  DollarSign, 
  Shield, 
  FileText, 
  X,
  User,
  LogOut,
  TrendingUp,
  Star,
  Activity
} from 'lucide-react';

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const [feed, setFeed] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [socket, setSocket] = useState(null);

  // Completion Modal State
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [completionData, setCompletionData] = useState({
    laborCharge: '',
    partsCharge: '',
    warrantyDays: '0',
    notes: ''
  });

  const openCompletionModal = (jobId) => {
      setSelectedJobId(jobId);
      setCompletionData({ laborCharge: '', partsCharge: '', warrantyDays: '0', notes: '' });
      setCompletionModalOpen(true);
  };

  const handleCompletionChange = (e) => {
      setCompletionData({ ...completionData, [e.target.name]: e.target.value });
  };

  const handleCompleteSubmit = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              status: 'Completed',
              pricing: {
                  laborCharge: Number(completionData.laborCharge),
                  partsCharge: Number(completionData.partsCharge)
              },
              warranty: {
                  periodDays: Number(completionData.warrantyDays),
                  expiryDate: new Date(Date.now() + Number(completionData.warrantyDays) * 24 * 60 * 60 * 1000)
              },
              completionDetails: {
                  notes: completionData.notes
              }
          };
          
          const { data } = await api.put(`/requests/${selectedJobId}/status`, payload);
          setMyJobs(myJobs.map((job) => (job._id === selectedJobId ? data : job)));
          setCompletionModalOpen(false);
      } catch (error) {
          console.error(error);
          alert('Error completing job');
      }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
      fetchMyJobs();

      const newSocket = io(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''));
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join_room', 'agents');
      });

      newSocket.on('new_request', (request) => {
        setFeed((prev) => [request, ...prev]);
      });

      return () => newSocket.close();
    }
  }, [user]);

  const fetchFeed = async () => {
    try {
      const { data } = await api.get('/requests/feed');
      setFeed(data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/requests/agent/jobs');
      setMyJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleAccept = async (id) => {
    try {
      const { data } = await api.put(`/requests/${id}/accept`);
      setFeed(feed.filter((req) => req._id !== id));
      setMyJobs([data, ...myJobs]);
      setActiveTab('jobs'); // Switch to jobs tab automatically
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const { data } = await api.put(`/requests/${id}/status`, { status });
      setMyJobs(myJobs.map((job) => (job._id === id ? data : job)));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center bg-gray-50 text-primary">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-gray-900 sm:block">Agent Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Online
              </div>
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
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Reliability', value: `${user.reliability?.onTimePercentage || 100}%`, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completion', value: `${user.reliability?.jobCompletionPercentage || 100}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Rating', value: `${user.rating || 0}★`, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Earnings', value: `₹${user.earnings || 0}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-1 rounded-xl bg-white p-1 shadow-sm sm:w-fit">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 rounded-lg px-6 py-2.5 text-sm font-medium transition-all sm:flex-none ${
              activeTab === 'feed'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Job Feed
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 rounded-lg px-6 py-2.5 text-sm font-medium transition-all sm:flex-none ${
              activeTab === 'jobs'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            My Active Jobs
          </button>
        </div>

        {/* Content */}
        {activeTab === 'feed' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feed.length === 0 ? (
              <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
                <Briefcase className="mb-4 h-10 w-10 text-gray-300" />
                <p>No new jobs available right now.</p>
              </div>
            ) : (
              feed.map((req) => (
                <div key={req._id} className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/10">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wide">
                        {req.category}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="mb-4 font-medium text-gray-900">{req.description}</p>
                    <div className="mb-6 flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      {req.address}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark active:scale-95"
                  >
                    Accept Job
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {myJobs.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
                <Briefcase className="mb-4 h-10 w-10 text-gray-300" />
                <p>You have no active jobs.</p>
              </div>
            ) : (
              myJobs.map((job) => (
                <div key={job._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                  <div className="border-b border-gray-100 bg-gray-50/50 p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{job.category} Service</h3>
                          {job.bookingMode === 'Emergency' && (
                            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                              </span>
                              EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Customer: {job.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          job.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-8 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div className="rounded-xl bg-gray-50 p-4">
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Job Details</h4>
                          <p className="text-gray-900">{job.description}</p>
                          {job.vehicleDetails && (
                            <div className="mt-3 border-t border-gray-200 pt-3 text-sm">
                              <p className="font-semibold text-gray-700">Vehicle Info:</p>
                              <p className="text-gray-600">{job.vehicleDetails.brand} - {job.vehicleDetails.issueDescription}</p>
                            </div>
                          )}
                          {job.media && job.media.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                              {job.media.map((src, idx) => (
                                <img key={idx} src={src} alt="Issue" className="h-20 w-20 rounded-lg object-cover ring-1 ring-gray-200" />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {job.address}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {job.user?.phone || 'No phone provided'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-3">
                         {job.status === 'Accepted' && (
                            <button
                              onClick={() => handleStatusUpdate(job._id, 'OnTheWay')}
                              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 font-bold text-white shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-600"
                            >
                              <Navigation className="h-5 w-5" /> Start Navigation
                            </button>
                          )}
                          {job.status === 'OnTheWay' && (
                            <button
                              onClick={() => handleStatusUpdate(job._id, 'InProgress')}
                              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
                            >
                              <Briefcase className="h-5 w-5" /> Start Work
                            </button>
                          )}
                          {job.status === 'InProgress' && (
                            <button
                              onClick={() => openCompletionModal(job._id)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700"
                            >
                              <CheckCircle className="h-5 w-5" /> Complete Job
                            </button>
                          )}
                          {job.status === 'Completed' && (
                             <div className="rounded-xl bg-green-50 p-4 text-center text-green-700">
                                <CheckCircle className="mx-auto mb-2 h-8 w-8" />
                                <p className="font-bold">Job Completed Successfully</p>
                                <p className="text-sm">Earnings added to wallet.</p>
                             </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Completion Modal */}
        {completionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Final Invoice</h3>
                        <button onClick={() => setCompletionModalOpen(false)} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleCompleteSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Labor Charge (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="laborCharge"
                                    value={completionData.laborCharge}
                                    onChange={handleCompletionChange}
                                    required
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-primary focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Parts/Material Cost (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="partsCharge"
                                    value={completionData.partsCharge}
                                    onChange={handleCompletionChange}
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-primary focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Warranty (Days)</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="warrantyDays"
                                    value={completionData.warrantyDays}
                                    onChange={handleCompletionChange}
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                            <textarea
                                name="notes"
                                value={completionData.notes}
                                onChange={handleCompletionChange}
                                rows="2"
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-gray-900 focus:border-primary focus:ring-primary"
                                placeholder="Details about the fix..."
                            ></textarea>
                        </div>
                        
                        <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
                        >
                            Submit & Complete Job
                        </button>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
