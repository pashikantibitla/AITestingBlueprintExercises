import { useState } from 'react';
import { Job } from '../types/job';
import { Calendar, MapPin, DollarSign, ExternalLink, FileText, User, Mail, Building2, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
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
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setIsExpanded(!isExpanded)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('jobId', job.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{job.companyName}</h3>
          <p className="text-sm text-gray-600 truncate">{job.jobTitle}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{job.salary}</span>
          </div>
        )}
        {job.dateApplied && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Applied {formatDistanceToNow(new Date(job.dateApplied))} ago</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Building2 className="w-3 h-3" />
              <span>Via: {job.whereApplied}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Briefcase className="w-3 h-3" />
              <span>Found: {job.howFound}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="w-3 h-3" />
              <span className="truncate">Resume: {job.resumeUsed}</span>
            </div>
            {job.contactName && (
              <div className="flex items-center gap-1 text-gray-600">
                <User className="w-3 h-3" />
                <span>{job.contactName}</span>
              </div>
            )}
          </div>

          {job.jobDescription && (
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Job Description:</p>
              <p className="line-clamp-3">{job.jobDescription}</p>
            </div>
          )}

          {job.notes && (
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              <p className="font-medium mb-1">Notes:</p>
              <p>{job.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this job?')) {
                  onDelete(job.id);
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
            {job.applicationUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {!isExpanded && job.notes && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          <span className="font-medium">Notes:</span> {job.notes}
        </div>
      )}
    </div>
  );
}
