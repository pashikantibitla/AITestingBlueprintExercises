ROLE: You are a Senior QA Engineer with 10+ years of experience.

TASK: Generate comprehensive test cases from this PRD.

COVERAGE AREAS:

- Functional (happy path)
- Negative scenarios
- Boundary values
- Edge cases
CONSTRAINTS:

- Use ONLY PRD content
- No assumptions about unmentioned features
- Mark unclear items as "Needs clarification"
- Do NOT invent error messages or codes
FORMAT:
| TID | Category | Description | Pre-conditions | Steps | Expected | Priority |
|---|---|---|---|---|---|---|
| TC-001 | Functional | Create an A/B Test with multiple variations | User logged in, Project created | 1. Go to Experimentation > A/B Test. 2. Define hypothesis and target metrics. 3. Configure test variations using Visual Editor. 4. Select audience segment. 5. Launch test. | Test is launched and status is "Monitoring progress". All variations are visible in the preview. | Must |
| TC-002 | Functional | Setup Split URL Testing | User logged in | 1. Navigate to Split URL testing setup. 2. Enter Original URL and Variation URL(s). 3. Define metrics. 4. Launch. | Traffic is distributed according to configuration. Winner is eventually determined. | Must |
| TC-003 | Functional | Multivariate Testing Setup | User logged in | 1. Navigate to Multivariate testing. 2. Define variations for multiple elements. 3. Launch test. | System combines variations correctly. Reports show performance of each combination. | Must |
| TC-004 | Edge | SmartStats analysis for low traffic | Test launched with low traffic | 1. Monitor SmartStats for an active test with very few visitors. | SmartStats provides Bayesian analysis; results marked as "Inconclusive" until statistical significance (Needs clarification: threshold for significance). | High |
| TC-005 | Boundary | Max variations in A/B test | User logged in | 1. Start creating an A/B test. 2. Add variations up to the system limit. | (Needs clarification: Max variations not specified in PRD). | Medium |
| TC-006 | Functional | Heatmap generation | Tracking code active on page | 1. Go to Insights > Heatmaps. 2. Select page. | Heatmap overlay showing click, scroll, and focus areas is displayed. | Must |
| TC-007 | Functional | Session Recording Playback | Sessions recorded | 1. Go to Insights > Session Recordings. 2. Play a session. | User interactions are visually replayed correctly. | Must |
| TC-008 | Boundary | Audience Targeting - Multiple attributes | User logged in | 1. Create segment using Geography, Behavior, and Demographics. | Users matching all criteria are segments. (Needs clarification: Max attributes per segment). | High |
| TC-009 | Negative | RBAC - Unauthorized edit | User with Viewer role | 1. Attempt to edit an active experiment. | Edit action is restricted; "Access Denied" or similar message displayed. | Must |
| TC-010 | Functional | Shopify Integration Sync | Shopify account available | 1. Go to Integrations > Shopify. 2. Complete handshake. | Data syncs between VWO and Shopify successfully. | High |
| TC-011 | Non-Functional | Performance - Editor Loading | Visual Editor opened | 1. Load editor for a standard web page. | Editor is interactive within 2 seconds. | Must |
| TC-012 | Security | 2FA Authentication | 2FA enabled for account | 1. Login with valid credentials. 2. Enter 2FA code. | User is granted access to the dashboard. | Must |
| TC-013 | Functional | Funnel Analytics Drop-off Points | Funnel defined | 1. Go to Insights > Funnels. 2. View active funnel. | Visualization clearly shows where users drop off at each step. | Must |
| TC-014 | Functional | Real-time Personalization | Personalization campaign active | 1. Access site as a targeted segment user. | Customized content is delivered in real-time. | High |
| TC-015 | Functional | Kanban Workflow Statues | VWO Plan active | 1. Move experiment card in Kanban board. | Card status and team notifications (Needs clarification: notification behavior) update. | Medium |
| TC-016 | Data Privacy | GDPR Compliance - Data access | Request for user data access | 1. Access data privacy settings. | System allows export/deletion of user data as per GDPR/CCPA. | Must |
| TC-017 | Negative | Launch test without target metrics | Hypothesis defined, no metrics | 1. Attempt to launch an A/B test. | System prevents launch and prompts for target metrics. | Must |
| TC-018 | Reliability | 99.9% Uptime check | System monitoring | 1. Check system availability logs. | Availability meets 99.9% SLA for enterprise customers. | Must |



