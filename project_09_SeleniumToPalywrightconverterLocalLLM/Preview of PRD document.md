# VWO PLATFORM TEST PLAN

| TID    | Category       | Description                | Pre-conditions                 | Steps                                          | Expected Result                                | Priority |
| :----- | :------------- | :------------------------- | :----------------------------- | :--------------------------------------------- | :--------------------------------------------- | :------- |
| TC-001 | Functional     | Create A/B Test            | User logged in, Project exists | 1. Go to A/B Test. 2. Define metrics. 3. Launch | Test launched; Status is "Monitoring progress" | Must     |
| TC-002 | Functional     | Setup Split URL Testing    | User logged in                 | 1. Enter URLs. 2. Define metrics. 3. Launch    | Traffic distributed; SmartStats tracks visitor | Must     |
| TC-003 | Functional     | Multivariate Testing       | User logged in                 | 1. Define variations. 2. Launch test.          | System tracks all combinations correctly.      | Must     |
| TC-004 | Edge           | SmartStats Low Traffic     | Test active (< 50 visitors)    | 1. Monitor stats for low volume test.          | Marked "Inconclusive" until significance.      | High     |
| TC-005 | Boundary       | Max Variation Limit        | User logged in                 | 1. Add variations until system limit.          | System restricts adding beyond limit.          | Medium   |
| TC-006 | Functional     | Heatmap Generation         | Tracking active                | 1. Go to Insights > Heatmaps. 2. Select page.  | Heatmap overlay rendered correctly on page.    | Must     |
| TC-007 | Functional     | Session Playback           | Sessions recorded              | 1. Go to Insights > Sessions. 2. Play video.   | Interactions (click/scroll) replayed with sync | Must     |
| TC-008 | Boundary       | Multi-attribute Targeting  | User logged in                 | 1. Create segment with 5+ attributes.          | Users matching rules included in segment.      | High     |
| TC-009 | Negative       | RBAC Access Denied         | User with 'Viewer' role        | 1. Login as Viewer. 2. Attempt Edit/Delete.    | Action buttons disabled; "Access Denied" shown | Must     |
| TC-010 | Functional     | Shopify Sync               | Shopify API enabled            | 1. Go to Integrations. 2. Manual sync.         | Data successfuly syncs with external platform. | High     |
| TC-011 | Non-Functional | Editor Loading Speed       | Stable connection              | 1. Load Editor for complex page.               | Editor fully interactive within 2 seconds.     | Must     |
| TC-012 | Security       | 2FA Login Process          | 2FA enabled                    | 1. Enter Credentials. 2. Enter 2FA code.       | Dashboard displayed securely.                  | Must     |
| TC-013 | Functional     | Funnel Step Drop-off       | Funnel defined                 | 1. Go to Insights > Funnels. 2. View report.   | UI shows drop-off rates versus completion.     | Must     |
| TC-014 | Functional     | Real-time Personalization  | Campaign active                | 1. Access page as targeted segment user.       | Tailored content served instantly.             | High     |
| TC-015 | Functional     | Kanban Board Move          | Workflow active                | 1. Move card in Kanban board.                  | Status updates; timestamp captured in log.     | Medium   |
| TC-016 | Data Privacy   | GDPR Data Export           | User data request              | 1. Go to Settings > Privacy. 2. Export data.   | Downloadable JSON/CSV file is generated.       | Must     |
| TC-017 | Negative       | Missing Metric Error       | Partial setup                  | 1. Attempt Launch without metrics.             | "Target Metric Required" error displayed.      | Must     |
| TC-018 | Reliability    | Uptime Verification        | Enterprise account             | 1. Review monthly uptime report.               | Uptime recorded as >= 99.9%.                   | Must     |
