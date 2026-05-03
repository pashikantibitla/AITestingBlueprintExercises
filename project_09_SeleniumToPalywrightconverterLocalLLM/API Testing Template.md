# API Testing Template - VWO Platform
**Role:** API Testing Specialist
**Context:** Based on VWO PRD (Jan 7, 2026)

> **Note:** The current PRD provides high-level functional requirements. Detailed technical specifications (specific URIs, JSON structures, and exact status codes) are not present in the source documentation. Per constraints, these are marked as **[Needs API Documentation]**.

| Test ID | Endpoint | Method | Request Body | Expected Status | Expected Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **API-001** | `[Needs Doc]/experiments` | POST | `{ "type": "AB", "variations": [...], "metrics": [...] }` | `[Needs Doc]` | Result of A/B test creation |
| **API-002** | `[Needs Doc]/stats` | GET | `?experiment_id=[ID]` | `[Needs Doc]` | Bayesian SmartStats payload |
| **API-003** | `[Needs Doc]/targeting` | POST | `{ "segment": { "geo": "US", "behavior": "..." } }` | `[Needs Doc]` | Audience segment confirmation |
| **API-004** | `[Needs Doc]/insights/heatmaps` | GET | `?url=[EncodedURL]` | `[Needs Doc]` | Heatmap coordinate data |
| **API-005** | `[Needs Doc]/auth/2fa` | POST | `{ "code": "123456" }` | `[Needs Doc]` | Auth token or Error message |
| **API-006** | `[Needs Doc]/integrations/shopify` | POST | `{ "api_key": "...", "sync_freq": "..." }` | `[Needs Doc]` | Handshake success/failure |
| **API-007** | `[Needs Doc]/plan/kanban` | PATCH | `{ "card_id": "...", "state": "complete" }` | `[Needs Doc]` | Updated status and timestamp |
| **API-008** | `[Needs Doc]/privacy/export` | POST | `{ "user_id": "...", "format": "json" }` | `[Needs Doc]` | GDPR-compliant data link |

### **API Test Coverage Log**
*   **Happy Path:** Valid requests for experiment creation and data fetching.
*   **Invalid Inputs:** Validation checks for missing metrics or malformed JSON (to be defined).
*   **Auth/Auth:** Handling of 2FA and role-based access tokens.
*   **Error Handling:** Documentation required for exact status codes (e.g., 400, 401, 403, 500).
*   **Boundary Conditions:** Max variations in request body, large payload syncs.

---
*Created by API Testing Specialist | Antigravity AI*
