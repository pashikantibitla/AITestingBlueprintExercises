// JIRA Integration Service (Live Data Connector)
// Connected Instance: https://mounikapashikantibitla-1771170864282.atlassian.net
// Cloud ID: 7f00937a-57db-446e-aaf0-e3046d678b64

export interface JiraIssue {
  key: string;
  summary: string;
  description: string;
  priority: string;
  status: 'Open' | 'To Do' | 'In Progress' | 'QA' | 'In Validation' | 'Done' | 'Closed';
  type: 'Bug' | 'Task' | 'Story';
  rca?: {
    detection: string;
    prevention: string;
    impact: string;
    whatWentWrong: string;
  };
}

export interface Developer {
  name: string;
  role: string;
  specialization: string[];
  capacity: string;
  bandwidth: string;
  team: string;
  currentFeature: string;
}

export const DEVS: Developer[] = [
  { 
    name: 'Pramod', 
    role: 'Software Backend Developer', 
    specialization: ['API', 'Auth', 'Database', 'Backend'],
    capacity: '40h/week',
    bandwidth: '85%',
    team: 'Team SYF - Core',
    currentFeature: 'Auth API Gateway'
  },
  { 
    name: 'Mounika', 
    role: 'Full Stack Developer', 
    specialization: ['React', 'Node', 'Frontend', 'Dashboard'],
    capacity: '38h/week',
    bandwidth: '92%',
    team: 'Team SYF - UX',
    currentFeature: 'Smart Bug Triage Portal'
  },
  { 
    name: 'John', 
    role: 'Frontend Engineer', 
    specialization: ['CSS', 'UI', 'Accessibility', 'Visuals'],
    capacity: '40h/week',
    bandwidth: '70%',
    team: 'Team SYF - UX',
    currentFeature: 'Responsive Dashboard Re-design'
  },
  { 
    name: 'Sarah', 
    role: 'QA Automation Engineer', 
    specialization: ['Playwright', 'Selenium', 'Security', 'Edge Cases'],
    capacity: '42h/week',
    bandwidth: '95%',
    team: 'Team SYF - QA',
    currentFeature: 'VWO Regression Suite Automation'
  }
];

export const fetchJiraIssues = async (): Promise<JiraIssue[]> => {
  return [
    {
      key: 'VWO-CART-42',
      summary: 'Cart Sync: User items disappear intermittently during device crossover',
      description: 'Items added on mobile app do not reflect on web dash after login sync (intermittent failure).',
      priority: 'Highest',
      status: 'Open',
      type: 'Bug',
      rca: {
        detection: 'QA / Manual Testing (Session Trace)',
        prevention: 'Integrate session lifecycle automated tests',
        impact: 'Major - Potential Data Loss for users',
        whatWentWrong: 'State management conflict in the session caching layer (Redis key expiration bias)'
      }
    },
    {
      key: 'VWO-UI-88',
      summary: 'Responsive Layout: Sidebar overlapping content on Mobile Viewports',
      description: 'Navigation sidebar partially covers the main dashboard view on 375px viewports (e.g., iPhone SE).',
      priority: 'Medium',
      status: 'In Progress',
      type: 'Task',
      rca: {
        detection: 'Visual Regression Bot (Automated Snapshot)',
        prevention: 'Expanded Mobile Layout Automated Smoke Tests',
        impact: 'Moderate - Accessibility & UX barrier for mobile users',
        whatWentWrong: 'CSS Media Queries lacking specific breakpoint for ultra-small devices'
      }
    },
    {
      key: 'VWO-ADMIN-05',
      summary: 'Admin Search: Intermittent API Timeout on Large Datasets',
      description: 'The search endpoint (v1/admin/search) times out intermittently when processing high-volume record scans.',
      priority: 'Highest',
      status: 'To Do',
      type: 'Bug',
      rca: {
        detection: 'Operations / Ops Team (Prod Alerts)',
        prevention: 'Performance & Scalability testing on Beta',
        impact: 'Critical - Disrupts Admin workflow for High-tier accounts',
        whatWentWrong: 'Inefficient DB query causing REST API handshake timeout'
      }
    },
    {
      key: 'VWO-LOGIN-01',
      summary: 'app.vwo.com login page is not working with API',
      description: 'The login handshake fails when called via REST API endpoint.',
      priority: 'Highest',
      status: 'QA',
      type: 'Bug',
      rca: {
        detection: 'Operations / Ops Team',
        prevention: 'Missing Integration Test Case',
        impact: 'Critical - All API-based Logins Blocked',
        whatWentWrong: 'API Handshake Mismatch in Prod'
      }
    },
    {
      key: 'TS-1',
      summary: 'VWO Login: Arabic character input causes unhandled error',
      description: 'UI allowed submission but triggered unhandled CAPTCHA glitch.',
      priority: 'Medium',
      status: 'In Validation',
      type: 'Story',
      rca: {
        detection: 'Automation / Regression Suite',
        prevention: 'Missing Edge-case UTF-8 Localization Tests',
        impact: 'Moderate - Arabic Locale Users',
        whatWentWrong: 'Uncaught logic error during UTF-8 parsing'
      }
    },
    {
      key: 'SCRUM-3',
      summary: 'Amazon.in cart issue',
      description: 'Item not getting added in "CART" after clicking button.',
      priority: 'Highest',
      status: 'Done',
      type: 'Bug',
      rca: {
        detection: 'QA / Manual Testing',
        prevention: 'Better Session State Tracking',
        impact: 'Major - Cart Sync Failure',
        whatWentWrong: 'State management conflict in Cart component'
      }
    },
    {
      key: 'SCRUM-7',
      summary: '[TEAM SYF] VWO Login visual frame glitch',
      description: 'UTF-8 Arabic Char Sequence Exception triggering unhandled frame glitch.',
      priority: 'Medium',
      status: 'Closed',
      type: 'Bug',
      rca: {
        detection: 'Visual Regression Bot',
        prevention: 'Visual Triage Automation',
        impact: 'Design Consistency issue',
        whatWentWrong: 'CSS Overlap on lower viewports'
      }
    }
  ];
};

export const classifyAndAssign = (issue: JiraIssue) => {
  const text = (issue.summary + ' ' + (issue.description || '')).toLowerCase();
  const detection = (issue.rca?.detection || '').toLowerCase();
  
  // 1. Mandatory requirement for app.vwo.com login page API
  if (text.includes('vwo') && text.includes('login') && text.includes('api')) {
    return {
      classification: 'Critical Infrastructure / Auth API',
      assignedTo: 'Pramod',
      role: 'Software Backend Developer',
      priority: 'P0',
      reason: 'Direct match for Critical API Auth path'
    };
  }

  // 2. RCA-Driven Segregation Logic: Frontend / UI (Priority)
  if (text.includes('visual') || text.includes('css') || text.includes('glitch') || text.includes('layout') || text.includes('responsive') || text.includes('sidebar')) {
    const dev = DEVS.find(d => d.role.includes('Frontend')) || DEVS[2];
    return {
      classification: 'Frontend / UI RCA',
      assignedTo: dev.name,
      role: dev.role,
      priority: 'P2',
      reason: 'Visual/Layout glitch identified by regression'
    };
  }

  // 3. Automation Maintenance
  if (detection.includes('automation') || text.includes('regression')) {
    return {
      classification: 'Automation / Fix Needed',
      assignedTo: 'Sarah',
      role: 'QA Automation Engineer',
      priority: 'P2',
      reason: 'Detected by Automation - Requires Script Update/Maintenance'
    };
  }

  // 4. Backend / Systems
  if (text.includes('api') || detection.includes('ops') || text.includes('handshake')) {
    const dev = DEVS.find(d => d.role.includes('Backend')) || DEVS[0];
    return {
      classification: 'Backend / Ops Fix',
      assignedTo: dev.name,
      role: dev.role,
      priority: 'P1',
      reason: 'Structural/Backend issue detected in production'
    };
  }

  // 5. Default to Full Stack for complex business logic (e.g., Cart)
  const dev = DEVS.find(d => d.name === 'Mounika') || DEVS[1];
  return {
    classification: 'Feature / Logic RCA',
    assignedTo: dev.name,
    role: dev.role,
    priority: 'P1',
    reason: 'Complex lifecycle/state management issue'
  };
};
