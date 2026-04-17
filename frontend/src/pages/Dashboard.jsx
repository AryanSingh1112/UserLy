import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  UserPlus,
  UserMinus,
  Users,
  BarChart3,
  ExternalLink,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const IconComponent = icon;

  return (
    <div className="card p-6 flex flex-col justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-2">{subtitle}</p>}
      </div>
      <div className={`self-end p-3 rounded-2xl ${color} shadow-sm`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

const MetricBar = ({ label, value, percentage, color }) => (
  <div>
    <div className="flex items-center justify-between text-sm mb-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const ActivityChart = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px] grid grid-cols-7 gap-2 items-end h-40">
        {data.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <div className="w-full rounded-xl bg-slate-100 flex items-end overflow-hidden min-h-[120px]">
              <div
                className="w-full bg-primary-500 origin-bottom transition-all duration-300"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.12em]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    users: 0,
    weeklyNew: 0,
    growthRate: 0,
    weeklyGraph: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.role) return;

      try {
        const { data } = await api.get('/users?limit=1000');
        const usersList = data.data.users || [];
        const total = usersList.length;
        const active = usersList.filter((u) => u.status === 'active').length;
        const inactive = usersList.filter((u) => u.status === 'inactive').length;
        const admins = usersList.filter((u) => u.role === 'admin').length;
        const weeklyNew = usersList.filter((u) => {
          const created = new Date(u.createdAt);
          return Date.now() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
        }).length;
        const growthRate = total ? Math.round((weeklyNew / total) * 100) : 0;

        const now = new Date();
        const graphDays = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - index));
          const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          return {
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            key,
            value: 0,
          };
        });

        const graphMap = graphDays.reduce((map, item) => {
          map[item.key] = 0;
          return map;
        }, {});

        usersList.forEach((u) => {
          const created = new Date(u.createdAt);
          const key = `${created.getFullYear()}-${created.getMonth() + 1}-${created.getDate()}`;
          if (graphMap[key] !== undefined) {
            graphMap[key] += 1;
          }
        });

        const weeklyGraph = graphDays.map((item) => ({
          label: item.label,
          value: graphMap[item.key] || 0,
        }));

        const recent = [...usersList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          total,
          active,
          inactive,
          admins,
          users: total - admins,
          weeklyNew,
          growthRate,
          weeklyGraph,
          recent,
        });
      } catch (error) {
        console.error('Failed to load dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.role]);

  if (!user) {
    return <div className="py-20 text-center text-slate-500">Loading dashboard...</div>;
  }

  if (user.role !== 'admin') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {user.name}</h1>
          <p className="text-slate-500 mt-1">Overview of your account and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8 bg-white flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl mb-4 border-2 border-primary-200">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-6 flex gap-3">
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.role}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {user.status}
              </span>
            </div>
            <Link to="/profile" className="mt-8 btn-secondary w-full">
              Edit Profile
            </Link>
          </div>

          <div className="card p-8">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary-600" />
              Account Summary
            </h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-slate-500 mb-1">Created On</p>
                <p className="font-semibold text-slate-900">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Last Updated</p>
                <p className="font-semibold text-slate-900">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Support</p>
                <p className="font-semibold text-slate-900">
                  Contact admin for account or access changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-[0.3em] mb-2">Administrator Panel</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            A comprehensive view of users, growth, retention, and recent activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/users" className="btn-primary inline-flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Manage Users
          </Link>
          <Link to="/profile" className="btn-secondary inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Profile Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total users"
          value={stats.total}
          subtitle={`${stats.admins} admins · ${stats.users} users`}
          icon={Users}
          color="bg-indigo-600"
        />
        <StatCard
          title="Active users"
          value={stats.active}
          subtitle={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% active`}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          title="Inactive users"
          value={stats.inactive}
          subtitle={`${stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}% inactive`}
          icon={UserMinus}
          color="bg-rose-500"
        />
        <StatCard
          title="Weekly signups"
          value={stats.weeklyNew}
          subtitle={`${stats.growthRate}% growth`}
          icon={TrendingUp}
          color="bg-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weekly registration trend</h2>
              <p className="text-sm text-slate-500 mt-1">Signups per day for the last 7 days.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
              <BarChart3 className="w-4 h-4" />
              Outlook
            </div>
          </div>
          <ActivityChart data={stats.weeklyGraph} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Status distribution</h2>
              <p className="text-sm text-slate-500 mt-1">Overview of user account health.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.15em] text-slate-500">
              Live
            </div>
          </div>
          <div className="space-y-4">
            <MetricBar
              label="Active users"
              value={stats.active}
              percentage={stats.total ? Math.round((stats.active / stats.total) * 100) : 0}
              color="bg-emerald-500"
            />
            <MetricBar
              label="Inactive users"
              value={stats.inactive}
              percentage={stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}
              color="bg-rose-500"
            />
            <MetricBar
              label="Admins"
              value={stats.admins}
              percentage={stats.total ? Math.round((stats.admins / stats.total) * 100) : 0}
              color="bg-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="card p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent users</h2>
            <p className="text-sm text-slate-500 mt-1">Newest accounts created in the last 7 days.</p>
          </div>
          <Link to="/users" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            View all users
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
              Loading recent users...
            </div>
          ) : stats.recent.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
              No recent users found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.recent.map((userItem) => (
                <div
                  key={userItem._id}
                  className="flex items-center gap-4 rounded-3xl border border-slate-200 p-4 bg-white shadow-sm"
                >
                  <img
                    src={getAvatarUrl(userItem.name || userItem.email)}
                    alt={userItem.name}
                    className="w-14 h-14 rounded-full border border-slate-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{userItem.name}</h3>
                    <p className="text-sm text-slate-500">{userItem.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                        {userItem.role}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          userItem.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {userItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {new Date(userItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;