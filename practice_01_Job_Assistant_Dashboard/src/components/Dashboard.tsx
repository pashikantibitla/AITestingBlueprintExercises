import { Job, JobStatus } from '../types/job';
import { 
  Briefcase, 
  Send, 
  Users, 
  Award, 
  XCircle, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  const stats = {
    total: jobs.length,
    wishlist: jobs.filter(j => j.status === 'wishlist').length,
    applied: jobs.filter(j => j.status === 'applied').length,
    screening: jobs.filter(j => j.status === 'screening').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    accepted: jobs.filter(j => j.status === 'accepted').length,
  };

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const activeJobs = jobs.filter(j => 
    ['applied', 'screening', 'interview', 'offer'].includes(j.status)
  ).length;

  const successRate = stats.applied > 0 
    ? Math.round(((stats.interview + stats.offer + stats.accepted) / stats.applied) * 100) 
    : 0;

  const statCards = [
    { 
      label: 'Total Jobs', 
      value: stats.total, 
      icon: Briefcase, 
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700'
    },
    { 
      label: 'Applied', 
      value: stats.applied, 
      icon: Send, 
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700'
    },
    { 
      label: 'In Progress', 
      value: activeJobs, 
      icon: Clock, 
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50 text-yellow-700'
    },
    { 
      label: 'Interviews', 
      value: stats.interview, 
      icon: Users, 
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700'
    },
    { 
      label: 'Offers', 
      value: stats.offer, 
      icon: Award, 
      color: 'bg-green-500',
      lightColor: 'bg-green-50 text-green-700'
    },
    { 
      label: 'Accepted', 
      value: stats.accepted, 
      icon: CheckCircle, 
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700'
    },
    { 
      label: 'Rejected', 
      value: stats.rejected, 
      icon: XCircle, 
      color: 'bg-red-500',
      lightColor: 'bg-red-50 text-red-700'
    },
    { 
      label: 'Success Rate', 
      value: `${successRate}%`, 
      icon: TrendingUp, 
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 text-teal-700'
    },
  ];

  const getStatusColor = (status: JobStatus) => {
    const colors: Record<string, string> = {
      wishlist: 'bg-gray-100 text-gray-700',
      applied: 'bg-blue-100 text-blue-700',
      screening: 'bg-yellow-100 text-yellow-700',
      interview: 'bg-purple-100 text-purple-700',
      offer: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      accepted: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.lightColor} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h3>
        <div className="relative">
          <div className="flex items-center justify-between">
            {[
              { label: 'Wishlist', count: stats.wishlist, color: 'bg-gray-500' },
              { label: 'Applied', count: stats.applied, color: 'bg-blue-500' },
              { label: 'Screening', count: stats.screening, color: 'bg-yellow-500' },
              { label: 'Interview', count: stats.interview, color: 'bg-purple-500' },
              { label: 'Offer', count: stats.offer, color: 'bg-green-500' },
            ].map((step, index, array) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm`}>
                    {step.count}
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{step.label}</span>
                </div>
                {index < array.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{job.companyName}</p>
                    <p className="text-sm text-gray-500 truncate">{job.jobTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(job.updatedAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {[
              { label: 'Applied → Interview', from: stats.applied, to: stats.interview },
              { label: 'Interview → Offer', from: stats.interview, to: stats.offer },
              { label: 'Offer → Accepted', from: stats.offer, to: stats.accepted },
            ].map((funnel, index) => {
              const rate = funnel.from > 0 ? Math.round((funnel.to / funnel.from) * 100) : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{funnel.label}</span>
                    <span className="font-medium text-gray-900">{rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{funnel.to} / {funnel.from}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
