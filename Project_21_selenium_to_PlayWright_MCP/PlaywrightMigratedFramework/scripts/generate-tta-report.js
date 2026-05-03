/**
 * TTA Automation Report Generator
 * Reads Playwright JSON results and generates a styled HTML dashboard
 */

const fs = require('fs');
const path = require('path');

const RESULTS_JSON = path.join(__dirname, '..', 'test-results', 'results.json');
const OUTPUT_HTML = path.join(__dirname, '..', 'tta-report', 'index.html');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatDuration(ms) {
  if (!ms && ms !== 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

function extractPriority(tags) {
  if (!tags || !Array.isArray(tags)) return 'P1';
  const tagStr = tags.join(' ');
  if (tagStr.includes('@P0')) return 'P0';
  if (tagStr.includes('@P1')) return 'P1';
  if (tagStr.includes('@P2')) return 'P2';
  return 'P1';
}

function extractTags(tagsArray) {
  if (!tagsArray || !Array.isArray(tagsArray)) return '';
  return tagsArray.filter(t => t && typeof t === 'string').join(', ');
}

function getStatusInfo(testStatus, results) {
  // Playwright JSON status values:
  // "expected" = passed as expected
  // "unexpected" = failed unexpectedly
  // "flaky" = failed then passed on retry
  // "skipped" = skipped
  if (testStatus === 'expected') {
    return { status: 'PASSED', statusClass: 'passed', isPass: true, isFail: false, isSkip: false };
  }
  if (testStatus === 'unexpected') {
    return { status: 'FAILED', statusClass: 'failed', isPass: false, isFail: true, isSkip: false };
  }
  if (testStatus === 'flaky') {
    return { status: 'FLAKY', statusClass: 'passed', isPass: true, isFail: false, isSkip: false };
  }
  if (testStatus === 'skipped') {
    return { status: 'SKIPPED', statusClass: 'skipped', isPass: false, isFail: false, isSkip: true };
  }
  return { status: 'UNKNOWN', statusClass: 'skipped', isPass: false, isFail: false, isSkip: false };
}

function generateReport() {
  if (!fs.existsSync(RESULTS_JSON)) {
    console.error('❌ results.json not found. Run tests with JSON reporter first.');
    console.error('   Run: npx playwright test --reporter=json');
    process.exit(1);
  }

  const raw = fs.readFileSync(RESULTS_JSON, 'utf-8');
  const data = JSON.parse(raw);

  const rows = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let totalDuration = 0;

  function walkSuites(suites, parentTitle = '') {
    for (const suite of suites || []) {
      const suiteName = suite.title || parentTitle;

      // Process specs at this level
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          totalTests++;

          const statusInfo = getStatusInfo(test.status, test.results);
          if (statusInfo.isPass) passedTests++;
          if (statusInfo.isFail) failedTests++;
          if (statusInfo.isSkip) skippedTests++;

          // Duration is sum of all result durations (including retries)
          const duration = test.results?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0;
          totalDuration += duration;

          const tags = extractTags(spec.tags);
          const priority = extractPriority(spec.tags);

          // Get attachments from the LAST result (most recent run)
          let screenshot = null;
          let video = null;
          let trace = null;

          const lastResult = test.results?.[test.results.length - 1];
          if (lastResult) {
            for (const att of lastResult.attachments || []) {
              if (att.name === 'screenshot' && att.path) {
                screenshot = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
              if (att.name === 'video' && att.path) {
                video = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
              if (att.name === 'trace' && att.path) {
                trace = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
            }
          }

          // Also check all results for attachments (in case screenshot is on retry)
          for (const result of test.results || []) {
            for (const att of result.attachments || []) {
              if (att.name === 'screenshot' && att.path && !screenshot) {
                screenshot = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
              if (att.name === 'video' && att.path && !video) {
                video = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
              if (att.name === 'trace' && att.path && !trace) {
                trace = att.path.replace(/\\/g, '/').replace(/^.*test-results/, '../test-results');
              }
            }
          }

          const startTime = test.results?.[0]?.startTime;
          const lastResultEnd = test.results?.[test.results.length - 1];
          const endTimestamp = lastResultEnd?.startTime
            ? new Date(new Date(lastResultEnd.startTime).getTime() + (lastResultEnd.duration || 0)).toISOString()
            : null;

          rows.push({
            suite: suiteName,
            testName: spec.title,
            author: 'TTA-QA',
            priority,
            tags,
            file: spec.file || '-',
            startTime: formatDateTime(startTime),
            endTime: formatDateTime(endTimestamp),
            duration: formatDuration(duration),
            durationMs: duration,
            status: statusInfo.status,
            statusClass: statusInfo.statusClass,
            isPass: statusInfo.isPass,
            isFail: statusInfo.isFail,
            screenshot,
            video,
            trace,
            project: test.projectName || 'chromium',
            retryCount: (test.results || []).length - 1,
          });
        }
      }

      // Recurse into nested suites
      if (suite.suites) {
        walkSuites(suite.suites, suiteName);
      }
    }
  }

  walkSuites(data.suites);

  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  const runId = data.metadata?.runId || new Date().toISOString().replace(/[:T\-.]/g, '').slice(0, 14);
  const startedAt = formatDateTime(data.stats?.startTime || data.metadata?.startTime || new Date().toISOString());
  const browser = rows[0]?.project || 'chromium';
  const workers = data.config?.workers || data.metadata?.actualWorkers || 1;
  const platform = process.platform === 'win32' ? 'Windows' : process.platform === 'darwin' ? 'macOS' : 'Linux';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TTA Automation Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f7fa;
      color: #333;
      line-height: 1.5;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: white;
      padding: 24px 32px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .stats-container {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 24px 32px;
      flex-wrap: wrap;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px 28px;
      min-width: 130px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      border: 1px solid #e5e7eb;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      font-weight: 600;
    }
    .stat-total .stat-value { color: #374151; }
    .stat-passed .stat-value { color: #059669; }
    .stat-failed .stat-value { color: #dc2626; }
    .stat-skipped .stat-value { color: #f59e0b; }
    .stat-rate .stat-value { color: #2563eb; }
    .stat-duration .stat-value { color: #7c3aed; }

    .env-bar {
      background: white;
      margin: 0 32px 16px;
      padding: 12px 20px;
      border-radius: 8px;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      font-size: 13px;
    }
    .env-item { display: flex; align-items: center; gap: 8px; }
    .env-label { color: #6b7280; font-weight: 500; text-transform: uppercase; font-size: 11px; }
    .env-badge {
      background: #d1fae5;
      color: #065f46;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .env-badge.browser { background: #dbeafe; color: #1e40af; }
    .env-badge.platform { background: #f3e8ff; color: #6b21a8; }

    .filters {
      background: white;
      margin: 0 32px 16px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .filter-group:last-child { margin-bottom: 0; }
    .filter-label {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .filter-option {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #4b5563;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .filter-option:hover { background: #f3f4f6; }
    .filter-option input { cursor: pointer; }

    .table-container {
      margin: 0 32px 32px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead {
      background: #1f2937;
      color: white;
    }
    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }
    tbody tr:hover { background: #f9fafb; }
    tbody tr.failed { background: #fef2f2; }
    tbody tr.passed { background: #f0fdf4; }
    tbody tr.skipped { background: #fffbeb; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.passed {
      background: #d1fae5;
      color: #065f46;
    }
    .status-badge.failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-badge.skipped {
      background: #fef3c7;
      color: #92400e;
    }
    .status-badge.flaky {
      background: #fef3c7;
      color: #92400e;
    }

    .suite-tag {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .priority-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .priority-tag.p0 { background: #fee2e2; color: #991b1b; }
    .priority-tag.p1 { background: #dbeafe; color: #1e40af; }
    .priority-tag.p2 { background: #f3f4f6; color: #374151; }

    .action-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s;
      cursor: pointer;
      border: none;
    }
    .action-link.view {
      background: #fef2f2;
      color: #dc2626;
    }
    .action-link.view:hover { background: #fee2e2; }
    .action-link.play {
      background: #fef3c7;
      color: #d97706;
    }
    .action-link.play:hover { background: #fde68a; }
    .action-link.trace {
      background: #eff6ff;
      color: #2563eb;
    }
    .action-link.trace:hover { background: #dbeafe; }
    .action-link.disabled {
      background: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .retry-badge {
      background: #fee2e2;
      color: #991b1b;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 6px;
    }

    .test-name-cell {
      font-weight: 500;
      color: #111827;
      max-width: 320px;
      word-wrap: break-word;
    }
    .file-cell {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      color: #6b7280;
    }
    .time-cell {
      font-size: 11px;
      color: #6b7280;
      white-space: nowrap;
    }
    .duration-cell {
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }

    .hidden { display: none !important; }

    @media (max-width: 1200px) {
      .table-container { overflow-x: auto; }
      table { min-width: 1200px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 TTA Automation Report</h1>
    <p>The Testing Academy — Playwright Migrated Framework</p>
  </div>

  <div class="stats-container">
    <div class="stat-card stat-total">
      <div class="stat-value">${totalTests}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card stat-passed">
      <div class="stat-value">${passedTests}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card stat-failed">
      <div class="stat-value">${failedTests}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card stat-skipped">
      <div class="stat-value">${skippedTests}</div>
      <div class="stat-label">Skipped</div>
    </div>
    <div class="stat-card stat-rate">
      <div class="stat-value">${passRate}%</div>
      <div class="stat-label">Pass Rate</div>
    </div>
    <div class="stat-card stat-duration">
      <div class="stat-value">${formatDuration(totalDuration)}</div>
      <div class="stat-label">Duration</div>
    </div>
  </div>

  <div class="env-bar">
    <div class="env-item">
      <span class="env-label">Environment</span>
      <span class="env-badge">QA</span>
    </div>
    <div class="env-item">
      <span class="env-label">Browser</span>
      <span class="env-badge browser">${browser.toUpperCase()}</span>
    </div>
    <div class="env-item">
      <span class="env-label">Platform</span>
      <span class="env-badge platform">${platform}</span>
    </div>
    <div class="env-item">
      <span class="env-label">Workers</span>
      <span style="font-weight:600;color:#374151;">${workers}</span>
    </div>
    <div class="env-item">
      <span class="env-label">Run ID</span>
      <span style="font-family:monospace;font-size:12px;color:#6b7280;">${runId}</span>
    </div>
    <div class="env-item">
      <span class="env-label">Started</span>
      <span style="font-size:12px;color:#374151;">${startedAt}</span>
    </div>
  </div>

  <div class="filters">
    <div class="filter-group">
      <span class="filter-label">📌 Priority:</span>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="priority" value="all">
        All
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="priority" value="P0">
        P0
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="priority" value="P1">
        P1
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="priority" value="P2">
        P2
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="priority" value="Smoke">
        Smoke
      </label>
    </div>
    <div class="filter-group">
      <span class="filter-label">📊 Status:</span>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="status" value="all">
        All
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="status" value="PASSED">
        ✅ Passed
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="status" value="FAILED">
        ❌ Failed
      </label>
      <label class="filter-option">
        <input type="checkbox" checked onchange="filterTable()" data-filter="status" value="SKIPPED">
        ⏭️ Skipped
      </label>
    </div>
  </div>

  <div class="table-container">
    <table id="resultsTable">
      <thead>
        <tr>
          <th>S.NO</th>
          <th>SUITE</th>
          <th>TEST NAME</th>
          <th>AUTHOR</th>
          <th>PRIORITY</th>
          <th>TAGS</th>
          <th>FILE</th>
          <th>START TIME</th>
          <th>END TIME</th>
          <th>DURATION</th>
          <th>STATUS</th>
          <th>SCREENSHOT</th>
          <th>VIDEO</th>
          <th>TRACE</th>
        </tr>
      </thead>
      <tbody>
${rows.map((row, i) => {
  const screenshotBtn = row.screenshot
    ? `<a class="action-link view" href="${row.screenshot}" target="_blank">📷 View</a>`
    : '<span class="action-link disabled">N/A</span>';
  const videoBtn = row.video
    ? `<a class="action-link play" href="${row.video}" target="_blank">▶️ Play</a>`
    : '<span class="action-link disabled">N/A</span>';
  const traceBtn = row.trace
    ? `<button class="action-link trace" onclick="alert('Run: npx playwright show-trace &quot;${row.trace.replace(/\\/g, '\\\\')}&quot;')">🔍 View</button>`
    : '<span class="action-link disabled">N/A</span>';
  const retryBadge = row.retryCount > 0 ? `<span class="retry-badge">Retry ${row.retryCount}</span>` : '';

  return `        <tr class="${row.statusClass}" data-priority="${row.priority}" data-status="${row.status}">
          <td>${i + 1}</td>
          <td><span class="suite-tag">${row.project}</span></td>
          <td class="test-name-cell">${row.testName}${retryBadge}</td>
          <td>${row.author}</td>
          <td><span class="priority-tag ${row.priority.toLowerCase()}">${row.priority}</span></td>
          <td>${row.tags}</td>
          <td class="file-cell">${row.file}</td>
          <td class="time-cell">${row.startTime}</td>
          <td class="time-cell">${row.endTime}</td>
          <td class="duration-cell">${row.duration}</td>
          <td><span class="status-badge ${row.statusClass}">${row.status}</span></td>
          <td>${screenshotBtn}</td>
          <td>${videoBtn}</td>
          <td>${traceBtn}</td>
        </tr>`;
}).join('\n')}
      </tbody>
    </table>
  </div>

  <script>
    function filterTable() {
      const priorityChecks = document.querySelectorAll('input[data-filter="priority"]:checked');
      const statusChecks = document.querySelectorAll('input[data-filter="status"]:checked');

      const priorities = Array.from(priorityChecks).map(c => c.value);
      const statuses = Array.from(statusChecks).map(c => c.value);

      const rows = document.querySelectorAll('#resultsTable tbody tr');
      rows.forEach(row => {
        const rowPriority = row.dataset.priority;
        const rowStatus = row.dataset.status;

        const priorityMatch = priorities.includes('all') || priorities.includes(rowPriority);
        const statusMatch = statuses.includes('all') || statuses.includes(rowStatus);

        if (priorityMatch && statusMatch) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    }
  </script>
</body>
</html>`;

  ensureDir(path.dirname(OUTPUT_HTML));
  fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');

  console.log('✅ TTA Automation Report generated:');
  console.log(`   📄 ${OUTPUT_HTML}`);
  console.log(`   📊 ${totalTests} tests | ${passedTests} passed | ${failedTests} failed | ${passRate}% pass rate`);
  console.log('');
  console.log('   Open in browser:');
  console.log(`   npx serve tta-report`);
  console.log(`   OR open: tta-report/index.html`);
}

generateReport();
