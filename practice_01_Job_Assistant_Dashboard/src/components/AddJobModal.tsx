import { useState, useEffect } from 'react';
import { Job, JobStatus, JOB_TYPES, WHERE_APPLIED_OPTIONS, HOW_FOUND_OPTIONS } from '../types/job';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  initialStatus?: JobStatus;
  editingJob?: Job | null;
}

const emptyJob: Partial<Job> = {
  companyName: '',
  jobTitle: '',
  location: '',
  jobType: 'full-time',
  whereApplied: 'LinkedIn',
  howFound: 'Job Board',
  resumeUsed: '',
  jobDescription: '',
  salary: '',
  status: 'wishlist',
  dateApplied: '',
  applicationUrl: '',
  contactName: '',
  contactEmail: '',
  notes: '',
};

export function AddJobModal({ isOpen, onClose, onSave, initialStatus = 'wishlist', editingJob }: AddJobModalProps) {
  const [formData, setFormData] = useState<Partial<Job>>(emptyJob);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingJob) {
      setFormData(editingJob);
    } else {
      setFormData({ ...emptyJob, status: initialStatus });
    }
    setErrors({});
  }, [editingJob, initialStatus, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.jobTitle?.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.resumeUsed?.trim()) {
      newErrors.resumeUsed = 'Resume used is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const jobData: Job = {
      ...formData,
      id: editingJob?.id || uuidv4(),
      createdAt: editingJob?.createdAt || now,
      updatedAt: now,
    } as Job;

    onSave(jobData);
    onClose();
  };

  const handleChange = (field: keyof Job, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className={`input ${errors.companyName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="e.g., Google"
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="label">Job Title *</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className={`input ${errors.jobTitle ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="e.g., Software Engineer"
                  />
                  {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="input"
                    placeholder="e.g., San Francisco, CA (Remote)"
                  />
                </div>
                <div>
                  <label className="label">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => handleChange('jobType', e.target.value)}
                    className="input"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Where Applied</label>
                  <select
                    value={formData.whereApplied}
                    onChange={(e) => handleChange('whereApplied', e.target.value)}
                    className="input"
                  >
                    {WHERE_APPLIED_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">How Found</label>
                  <select
                    value={formData.howFound}
                    onChange={(e) => handleChange('howFound', e.target.value)}
                    className="input"
                  >
                    {HOW_FOUND_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Resume Used *</label>
                  <input
                    type="text"
                    value={formData.resumeUsed}
                    onChange={(e) => handleChange('resumeUsed', e.target.value)}
                    className={`input ${errors.resumeUsed ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="e.g., Resume_v3_Tech.docx"
                  />
                  {errors.resumeUsed && <p className="text-red-500 text-xs mt-1">{errors.resumeUsed}</p>}
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as JobStatus)}
                    className="input"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Salary/Compensation</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    className="input"
                    placeholder="e.g., $100k - $150k"
                  />
                </div>
                <div>
                  <label className="label">Date Applied</label>
                  <input
                    type="date"
                    value={formData.dateApplied}
                    onChange={(e) => handleChange('dateApplied', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Application URL</label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) => handleChange('applicationUrl', e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="label">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="input"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="label">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="input"
                    placeholder="e.g., john@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="space-y-4">
              <div>
                <label className="label">Job Description</label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => handleChange('jobDescription', e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="Paste job description here..."
                  rows={4}
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="input min-h-[80px] resize-none"
                  placeholder="Add any notes, follow-ups, or reminders..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingJob ? 'Update Job' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
