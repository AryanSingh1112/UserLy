import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

import { 
  UserCircle, 
  KeyRound, 
  User, 
  Mail, 
  Info,
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '' });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { data } = await api.patch('/users/me', formData);
      updateUser({ ...user, ...data.data });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsUpdating(true);
    try {
      await api.patch('/users/me', { password: passwordData.password });
      toast.success('Password updated');
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Security & Profile
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your account details and security settings
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-3xl bg-slate-50 border border-slate-200 p-4 shadow-sm">
          <img
            src={getAvatarUrl(user?.name || user?.email)}
            alt={user?.name}
            className="w-20 h-20 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Section */}
        <div className="space-y-8 lg:col-span-2">

          {/* General Info */}
          <section className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-slate-900 text-lg">
                General Information
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="input-field pl-10" 
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      disabled 
                      className="input-field pl-10 bg-slate-50 cursor-not-allowed opacity-70" 
                      value={user?.email} 
                    />
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="btn-primary min-w-[120px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Password Section */}
          <section className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-slate-900 text-lg">
                Security Settings
              </h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="New Password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, password: e.target.value })
                  }
                />

                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })
                  }
                />

              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdating || !passwordData.password}
                  className="btn-primary min-w-[120px]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          <section className="card p-6 bg-slate-900 text-white border-none">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-primary-400" />
              <div>
                <h3 className="font-bold">Account Access</h3>
                <p className="text-xs text-slate-400 uppercase">
                  {user?.role} Privilege
                </p>
              </div>
            </div>

            <p className="text-sm">
              Registered: {user?.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Profile;