import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  UserMinus, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users?page=${page}&search=${search}&role=${roleFilter}&status=${statusFilter}`);
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditMode(true);
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: ''
      });
    } else {
      setIsEditMode(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.patch(`/users/${selectedUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deactivated');
        fetchUsers();
      } catch (error) {
        toast.error('Deactivation failed');
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setSelectedUser(data.data);
      setIsDetailDrawerOpen(true);
    } catch (error) {
      toast.error('Failed to get user details');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Directory of all registered users</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="input-field w-auto min-w-[140px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select 
              className="input-field w-auto min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(user.name || user.email)}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        user.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 uppercase">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(user._id)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeactivate(user._id)}
                          disabled={user.status === 'inactive'}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Member' : 'Create New Member'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="input-field" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {!isEditMode && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Auto-generated if empty"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                  <select 
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                >
                  {isEditMode ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="h-full flex flex-col p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Member Details</h3>
                <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-primary-100 shadow-sm flex items-center justify-center text-primary-600 font-bold text-3xl mb-4">
                  {selectedUser.name.charAt(0)}
                </div>
                <h4 className="text-xl font-bold text-slate-900">{selectedUser.name}</h4>
                <p className="text-slate-500 text-sm mb-4">{selectedUser.email}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">{selectedUser.role}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedUser.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="space-y-8 flex-1">
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    System Information
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1 uppercase">ID Handle</p>
                      <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{selectedUser._id}</code>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 uppercase">Member Since</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 uppercase">Last Modified</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Audit Log
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1 uppercase">Created By</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedUser.createdBy ? `${selectedUser.createdBy.name} (${selectedUser.createdBy.email})` : 'System / Initial Seed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1 uppercase">Last Updated By</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedUser.updatedBy ? `${selectedUser.updatedBy.name} (${selectedUser.updatedBy.email})` : 'System / Initial Seed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <button 
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    handleOpenModal(selectedUser);
                  }}
                  className="flex-1 btn-primary"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    setIsDetailDrawerOpen(false);
                    handleDeactivate(selectedUser._id);
                  }}
                  disabled={selectedUser.status === 'inactive'}
                  className="flex-1 btn-secondary text-rose-600 hover:bg-rose-50 border-rose-100 disabled:opacity-30"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
