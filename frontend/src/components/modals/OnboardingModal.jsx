import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BaseModal from './BaseModal';
import { 
  User, Mail, Briefcase, MapPin, GraduationCap, 
  Banknote, Calendar, Upload, FileText, CheckCircle2, 
  Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import { useCitizen } from '../../context/CitizenContext';
import { createUser } from '../../services/api';

const OnboardingModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { setCitizen } = useCitizen();
  const [activeTab, setActiveTab] = useState('manual');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    occupation: 'Farmer',
    state: '',
    district: '',
    education: '',
    income: '',
    age: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.state || !formData.district) {
        throw new Error('Please fill all required fields');
      }

      const userData = {
        ...formData,
        age: parseInt(formData.age),
        income: parseInt(formData.income.replace(/[^\d]/g, '')) || 0
      };

      const response = await createUser(userData);
      
      if (response) {
        setCitizen(response);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiFill = () => {
    setIsExtracting(true);
    // Simulate AI extraction
    setTimeout(() => {
      setIsExtracting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        navigate('/dashboard');
      }, 1500);
    }, 2500);
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create Your Profile" 
      subtitle="Help us find the best government schemes for you"
      size="md"
    >
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'manual' ? 'bg-white shadow-sm text-indian-navy' : 'text-slate-500 hover:text-indian-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          Fill Manually
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'ai' ? 'bg-white shadow-sm text-indian-navy' : 'text-slate-500 hover:text-indian-navy'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indian-saffron" />
          AI Auto-Fill
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'manual' ? (
          <motion.form
            key="manual"
            onSubmit={handleManualSubmit}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <InputField 
              icon={<User />} 
              label="Full Name" 
              name="name"
              placeholder="Rajesh Kumar" 
              value={formData.name}
              onChange={handleChange}
              required
            />
            <InputField 
              icon={<Mail />} 
              label="Email Address" 
              name="email"
              placeholder="rajesh@example.com" 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="space-y-2">
              <label className="text-xs font-bold text-indian-navy/60 ml-1">Occupation</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indian-saffron transition-colors" />
                <select 
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-black/5 focus:border-indian-saffron outline-none transition-all font-medium appearance-none text-sm"
                >
                  <option>Farmer</option>
                  <option>Student</option>
                  <option>Small Business Owner</option>
                  <option>Artisan</option>
                </select>
              </div>
            </div>
            <InputField 
              icon={<MapPin />} 
              label="State" 
              name="state"
              placeholder="Uttar Pradesh" 
              value={formData.state}
              onChange={handleChange}
              required
            />
            <InputField 
              icon={<MapPin />} 
              label="District" 
              name="district"
              placeholder="Varanasi" 
              value={formData.district}
              onChange={handleChange}
              required
            />
            <InputField 
              icon={<GraduationCap />} 
              label="Education" 
              name="education"
              placeholder="Secondary School" 
              value={formData.education}
              onChange={handleChange}
            />
            <InputField 
              icon={<Banknote />} 
              label="Annual Income" 
              name="income"
              placeholder="₹2,50,000" 
              type="text" 
              value={formData.income}
              onChange={handleChange}
            />
            <InputField 
              icon={<Calendar />} 
              label="Age" 
              name="age"
              placeholder="28" 
              type="number" 
              value={formData.age}
              onChange={handleChange}
            />
            
            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isSuccess ? 'bg-indian-green text-white' : 'bg-indian-navy text-white hover:shadow-xl hover:shadow-indian-navy/20 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Profile Created!
                  </>
                ) : (
                  'Find My Schemes'
                )}
              </button>
              {!isLoading && !isSuccess && (
                <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indian-green" />
                  Your data is सुरक्षित and private
                </p>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="group relative border-2 border-dashed border-slate-200 hover:border-indian-saffron rounded-3xl p-12 flex flex-col items-center justify-center transition-all bg-slate-50/50">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indian-saffron" />
              </div>
              <h3 className="text-xl font-bold text-indian-navy mb-2">Upload your document</h3>
              <p className="text-slate-500 text-sm text-center max-w-xs">
                Drag & drop your Aadhaar, PAN Card, or Income Certificate. Supported: PDF, JPG, PNG
              </p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indian-navy/60 ml-1">Document Type</label>
              <input 
                placeholder="e.g. Aadhaar, PAN Card" 
                className="w-full px-4 py-4 rounded-xl bg-white border border-black/5 focus:border-indian-saffron outline-none transition-all font-medium"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={handleAiFill}
                disabled={isExtracting || isSuccess}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isSuccess ? 'bg-indian-green text-white' : 'bg-indian-navy text-white hover:shadow-xl'
                }`}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting your details...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Profile auto-filled successfully ✓
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Auto-Fill My Profile
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Upload once — we’ll auto-fill everything for you securely.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseModal>
  );
};

const InputField = ({ icon, label, placeholder, type = "text", name, value, onChange, required = false }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-indian-navy/60 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indian-saffron transition-colors">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-black/5 focus:border-indian-saffron outline-none transition-all font-medium text-sm text-indian-navy placeholder:text-slate-300"
      />
    </div>
  </div>
);

export default OnboardingModal;

