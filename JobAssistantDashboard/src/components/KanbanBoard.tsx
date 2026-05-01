import { useState } from 'react';
import { Job, COLUMNS, JobStatus } from '../types/job';
import { Column } from './Column';
import { AddJobModal } from './AddJobModal';

interface KanbanBoardProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

export function KanbanBoard({ jobs, setJobs }: KanbanBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [initialStatus, setInitialStatus] = useState<JobStatus>('wishlist');

  const handleAddJob = (status: string) => {
    setEditingJob(null);
    setInitialStatus(status as JobStatus);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleSaveJob = (job: Job) => {
    setJobs(prev => {
      const existingIndex = prev.findIndex(j => j.id === job.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = job;
        return updated;
      }
      return [...prev, job];
    });
  };

  const handleDropJob = (jobId: string, newStatus: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: newStatus as JobStatus, updatedAt: new Date().toISOString() }
          : job
      )
    );
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter(job => job.status === status);
  };

  return (
    <div className="h-full">
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(column => (
          <Column
            key={column.id}
            column={column}
            jobs={getJobsByStatus(column.id)}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onAddJob={handleAddJob}
            onDropJob={handleDropJob}
          />
        ))}
      </div>

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        initialStatus={initialStatus}
        editingJob={editingJob}
      />
    </div>
  );
}
