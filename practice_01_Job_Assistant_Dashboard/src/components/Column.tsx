import { useState } from 'react';
import { Job, ColumnType } from '../types/job';
import { JobCard } from './JobCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  jobs: Job[];
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onAddJob: (status: string) => void;
  onDropJob: (jobId: string, newStatus: string) => void;
}

export function Column({ column, jobs, onEditJob, onDeleteJob, onAddJob, onDropJob }: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      onDropJob(jobId, column.id);
    }
  };

  return (
    <div
      className={`flex flex-col min-w-[300px] max-w-[350px] rounded-xl border-2 ${
        isDragOver ? 'border-primary-400 bg-primary-50' : column.color
      } transition-all duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{column.title}</h2>
          <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddJob(column.id)}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          title="Add job to this column"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>No jobs yet</p>
            <p className="text-xs mt-1">Drop a job here or click + to add</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))
        )}
      </div>
    </div>
  );
}
