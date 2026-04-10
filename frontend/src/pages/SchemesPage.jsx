import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { allSchemes } from '../data/mockData';

const SchemeCard = ({ scheme }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full relative overflow-hidden">
      {/* Accent Line */}
      <div className={`absolute top-0 left-0 w-1 h-full ${scheme.isMatched ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
      
      <div className="flex justify-between items-start mb-4 pl-2">
        <h3 className="text-xl font-bold text-indian-navy pr-4">{scheme.name}</h3>
        <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-xl text-sm whitespace-nowrap">
          {scheme.benefit}
        </span>
      </div>
      
      <p className="text-slate-500 text-sm mb-6 flex-1 pl-2">{scheme.description}</p>
      
      <div className="space-y-4 pl-2">
        <div>
          <div className="flex justify-between text-sm mb-1.5 font-semibold">
            <span className="text-slate-600">Eligibility Match</span>
            <span className={scheme.isMatched ? 'text-indigo-600' : 'text-slate-500'}>{scheme.score}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full ${scheme.isMatched ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-400'}`}
               style={{ width: `${scheme.score}%` }}
             ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {scheme.status === 'Ready to Apply' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {scheme.status === 'Missing Documents' && <AlertCircle className="w-4 h-4 text-orange-500" />}
            {scheme.status === 'Not Eligible' && <AlertCircle className="w-4 h-4 text-slate-400" />}
            <span className={`text-xs font-bold ${
              scheme.status === 'Ready to Apply' ? 'text-green-600' : 
              scheme.status === 'Missing Documents' ? 'text-orange-600' : 'text-slate-500'
            }`}>
              {scheme.status}
            </span>
          </div>

          <div className="flex gap-2">
             <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Details</button>
             <button 
               disabled={scheme.status === 'Not Eligible'}
               className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-1 transition-colors ${
                 scheme.status !== 'Not Eligible' 
                  ? 'bg-indian-navy text-white hover:bg-blue-900 shadow-md shadow-indian-navy/20' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
               }`}
             >
               Apply <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchemesPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto pb-10 space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indian-navy tracking-tight">Eligible Schemes</h1>
          <p className="text-slate-500 mt-1">"These schemes are tailored to your profile using AI analysis."</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search schemes..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </motion.div>
  );
};

export default SchemesPage;
