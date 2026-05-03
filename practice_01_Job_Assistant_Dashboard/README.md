# Job Assistant Dashboard

A React-based Kanban-style job application tracking dashboard that helps you organize and monitor your job search journey.

![Job Assistant Dashboard](https://via.placeholder.com/800x400?text=Job+Assistant+Dashboard)

## Features

### 📋 Kanban Board
- **7 Columns**: Wishlist, Applied, Screening, Interview, Offer, Rejected, Accepted
- **Drag & Drop**: Move jobs between columns to update status
- **Quick Add**: Add jobs directly to any column
- **Expandable Cards**: Click to view full job details

### 📊 Dashboard View
- **Statistics**: Total jobs, applied, in progress, interviews, offers, and more
- **Pipeline Visualization**: Visual representation of your application funnel
- **Conversion Rates**: Track success rates between stages
- **Recent Activity**: Latest updates at a glance

### 📝 Job Details
Track comprehensive information for each job:
- Company name and job title
- Location and job type (full-time, part-time, contract, etc.)
- Where you applied (LinkedIn, Indeed, Company Website, etc.)
- How you found the job (Job Board, Referral, Networking, etc.)
- Resume version used
- Salary/compensation
- Application date
- Contact information
- Job description
- Personal notes

### 💾 Data Management
- **Local Storage**: All data saved locally in your browser
- **Export**: Download your data as JSON for backup
- **Import**: Restore from a previous export
- **Sample Data**: Pre-loaded with example jobs to get you started

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd JobAssistantDashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Usage Guide

### Adding a New Job

1. Click the **+** button on any column, or use the floating **+** button
2. Fill in the job details:
   - Required: Company Name, Job Title, Resume Used
   - Optional: Location, Salary, Contact info, Notes, etc.
3. Click **Add Job**

### Editing a Job

1. Click on any job card to expand it
2. Click the **Edit** button
3. Update the information
4. Click **Update Job**

### Moving Jobs Between Columns

**Option 1 - Drag & Drop:**
1. Click and hold a job card
2. Drag it to the desired column
3. Release to drop

**Option 2 - Edit:**
1. Expand the job card
2. Click **Edit**
3. Change the Status dropdown
4. Save

### Using the Dashboard

1. Click the **Dashboard** tab in the header
2. View your statistics and pipeline
3. Track conversion rates between stages
4. Monitor recent activity

### Backing Up Your Data

1. Click the **Export** button in the header
2. A JSON file will download with all your data
3. Store it safely for backup

### Restoring Data

1. Click the **Import** button
2. Select your previously exported JSON file
3. Confirm to replace current data

## Project Structure

```
JobAssistantDashboard/
├── src/
│   ├── components/
│   │   ├── AddJobModal.tsx    # Add/Edit job form
│   │   ├── Column.tsx         # Kanban column
│   │   ├── Dashboard.tsx      # Statistics dashboard
│   │   ├── JobCard.tsx        # Job card component
│   │   └── KanbanBoard.tsx    # Main kanban board
│   ├── data/
│   │   └── initialData.ts     # Sample jobs data
│   ├── hooks/
│   │   └── useLocalStorage.ts # Local storage hook
│   ├── types/
│   │   └── job.ts             # TypeScript types
│   ├── App.tsx                # Main app component
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Customization

### Adding New Status Columns

Edit `src/types/job.ts`:

```typescript
export type JobStatus = 
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'your-new-status'; // Add here
```

Then update the `COLUMNS` array:

```typescript
export const COLUMNS: ColumnType[] = [
  // ... existing columns
  { id: 'your-new-status', title: 'Your New Status', color: 'bg-pink-50 border-pink-300' },
];
```

### Changing Color Theme

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Change these values
    50: '#your-color',
    500: '#your-color',
    600: '#your-color',
  },
}
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have suggestions:
1. Check the browser console for errors
2. Clear local storage if data seems corrupted
3. Try exporting and re-importing your data
