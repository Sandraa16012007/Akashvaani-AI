import React, { useState } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, MapPin, Briefcase, GraduationCap, DollarSign, ShieldCheck, Edit3, X, Save, Loader2 } from 'lucide-react';
import { updateUser } from '../services/api';

const ProfileField = ({ icon: Icon, label, value, isEditing, onChange, name, type = "text" }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-100">
    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      {isEditing ? (
        <input 
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full mt-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      ) : (
        <p className="text-slate-700 font-semibold">{type === 'number' && name === 'income' ? `₹${Number(value || 0).toLocaleString()}` : (value || 'Not provided')}</p>
      )}
    </div>
  </div>
);

const ProfilePage = () => {
  const { citizenData, updateCitizen } = useCitizen();
  const profile = citizenData?.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Profile Found</h2>
        <p className="text-slate-500 max-w-md">Please complete your onboarding or use the "Try Demo Citizen" feature to load user data.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'income' ? Number(value) : value }));
  };

  const handleSave = async () => {
    if (citizenData.isDemo) {
      updateCitizen(formData);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await updateUser(profile.id, formData);
      updateCitizen(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Citizen Profile</h1>
          <p className="text-slate-500 mt-1">Manage and view your identity and professional details.</p>
        </div>
        <div className="flex gap-3">
          {error && <span className="text-red-500 text-sm font-medium self-center">{error}</span>}
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  key="cancel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => { setIsEditing(false); setFormData(profile); }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
                <motion.button
                  key="save"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileField icon={User} label="Full Name" name="name" value={formData.name} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={Mail} label="Email Address" name="email" value={formData.email} isEditing={false} />
        <ProfileField icon={Calendar} label="Age" name="age" type="number" value={formData.age} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={MapPin} label="State / Location" name="state" value={formData.state} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={Briefcase} label="Occupation" name="occupation" value={formData.occupation} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={GraduationCap} label="Education" name="education" value={formData.education} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={DollarSign} label="Annual Income" name="income" type="number" value={formData.income} isEditing={isEditing} onChange={handleChange} />
        <ProfileField icon={MapPin} label="District" name="district" value={formData.district} isEditing={isEditing} onChange={handleChange} />
      </div>

      {!isEditing && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-300" />
              Smart Benefit Matching
            </h3>
            <p className="text-blue-100 text-sm opacity-90 max-w-lg">Your profile details are being used to automatically scan for new government schemes. Keep your profile updated for accurate matching.</p>
          </div>
          <div className="relative z-10 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-bold uppercase tracking-wider">
             Status: Profile Verified
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage;

