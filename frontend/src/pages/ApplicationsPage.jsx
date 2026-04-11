import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getApplicationsByUser } from '../services/api';
import { useCitizen } from '../context/CitizenContext';
import ApplicationCard from '../components/ApplicationCard';

const ApplicationStatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || 'pending';
  if (s === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-lg border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    );
  }
  if (s === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-lg border border-red-200">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-bold text-xs rounded-lg border border-orange-200">
      <Clock className="w-3.5 h-3.5" /> {status || 'Pending'}
    </span>
  );
};

const ApplicationsPage = () => {
  const { citizenData } = useCitizen();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      const userId = citizenData?.profile?.id;
      console.log('ApplicationsPage: fetchApps triggered for userId:', userId);
      
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getApplicationsByUser(userId);
        if (data && data.length > 0) {
          console.log('%c [SYNC DEBUG] First Application Record:', 'color: #ff00ff; font-weight: bold;', data[0]);
        }
        setApplications(data || []);
      } catch (err) {
        console.error('ApplicationsPage: Fetch failed:', err);
        setError('Unable to load applications. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [citizenData?.profile?.id]);

  const filteredApps = applications.filter(app => {
    const s = searchTerm.toLowerCase();
    const schemeMatch = app.schemeName?.toLowerCase().includes(s);
    const idMatch = String(app.id || '').toLowerCase().includes(s);
    return schemeMatch || idMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto pb-20 space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-indian-navy tracking-tight">Track Applications</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your submitted interest and monitor real-time approval status.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or Scheme Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
             <div className="w-16 h-16 border-4 border-indian-saffron rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Accessing Records...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-red-50 rounded-[40px] border border-red-100 mx-auto max-w-2xl px-8">
           <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <p className="text-red-700 font-bold text-lg mb-2">{error}</p>
           <button onClick={() => window.location.reload()} className="text-red-600 underline font-bold">Try again</button>
        </div>
      ) : (
        <div className="w-full">
           {filteredApps.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredApps.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
             </div>
           ) : (
             <div className="py-32 text-center bg-white rounded-[48px] border border-black/5 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-indian-navy mb-3">No applications tracked</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  {searchTerm 
                    ? `We couldn't find any applications matching "${searchTerm}".` 
                    : "You haven't applied for any schemes yet. Visit the schemes page to get started."}
                </p>
                {!searchTerm && (
                   <button 
                     onClick={() => (window.location.href = '/dashboard/schemes')}
                     className="mt-8 px-8 py-3.5 bg-indian-saffron text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indian-saffron/20 uppercase tracking-widest text-sm"
                   >
                     Browse Schemes
                   </button>
                )}
             </div>
           )}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationsPage;
