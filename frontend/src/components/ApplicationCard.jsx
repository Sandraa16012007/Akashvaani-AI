import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, FileText, Calendar, Hash } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || 'pending';
  
  const statusStyles = {
    submitted: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
    pending: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> },
    approved: { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    rejected: { color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle className="w-3.5 h-3.5" /> }
  };

  const style = statusStyles[s] || statusStyles.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-black text-[10px] uppercase tracking-widest ${style.color}`}>
      {style.icon}
      {status || 'Pending'}
    </span>
  );
};

const ApplicationCard = ({ application }) => {
  const { id, status, created_at, scheme } = application;
  
  // Resilient fallback defaults
  const displayTitle = scheme?.scheme_name || 'Scheme Processing...';
  const displayDesc = scheme?.description || 'Your application is being synchronized with our government records. High-fidelity details will appear shortly.';
  const displayBenefit = scheme?.benefit || 'Benefit Analysis Pending';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Header with status and ID */}
      <div className="flex justify-between items-start mb-6">
        <StatusBadge status={status} />
        <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
             <Hash className="w-3 h-3" />
             <span>ID: {String(id).split('-')[0]}...</span>
           </div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
             <Calendar className="w-3 h-3" />
             <span>Applied: {created_at ? new Date(created_at).toLocaleDateString() : 'Recent'}</span>
           </div>
        </div>
      </div>

      {/* Scheme Content */}
      <div className="flex-1">
        <h3 className={`text-2xl font-black mb-4 group-hover:text-indian-saffron transition-colors tracking-tight line-clamp-2 ${!scheme ? 'text-slate-300' : 'text-indian-navy'}`}>
          {displayTitle}
        </h3>
        
        <p className="text-indian-navy/70 mb-6 leading-relaxed line-clamp-3 text-sm font-medium">
          {displayDesc}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className={`inline-block text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border whitespace-nowrap ${!scheme ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-indian-green/10 text-indian-green border-indian-green/20'}`}>
             {displayBenefit}
          </span>
          {scheme?.state && (
            <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-100 italic">
               Region: {scheme.state}
            </span>
          )}
        </div>

        {/* Full Eligibility Summary */}
        {scheme?.eligibility_rules && (
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-indian-navy/40 uppercase tracking-widest mb-3">Eligibility Details</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scheme.eligibility_rules).map(([key, val]) => (
                <div key={key} className="bg-slate-50 border border-black/5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-indian-navy/70 flex items-center gap-2">
                  <div className="w-1 h-1 bg-indian-saffron rounded-full"></div>
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-indian-navy font-black">{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Required */}
        {scheme?.documents_required && scheme.documents_required.length > 0 && (
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-indian-navy/40 uppercase tracking-widest mb-3">Documents Needed</h4>
            <div className="flex flex-wrap gap-2">
              {scheme.documents_required.map((doc, idx) => (
                <span key={idx} className="bg-indian-saffron/10 text-indian-saffron text-[10px] font-black px-3 py-1.5 rounded-lg border border-indian-saffron/20 uppercase tracking-wider">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
         <div className="flex items-center gap-2 text-slate-400">
           <FileText className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-widest">Application Details</span>
         </div>
         <button className="px-6 py-2.5 bg-indian-navy hover:bg-indian-saffron text-white font-black text-xs rounded-xl transition-all uppercase tracking-widest shadow-sm hover:shadow-md">
            Track Status
         </button>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
