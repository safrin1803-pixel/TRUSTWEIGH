# TRUSTWEIGH — Manual Test Cases

> These are suggested manual tests. Run them in a safe development environment and record actual results. Expected outcomes must be reconciled with the implementation.

| Test ID | Area | Test procedure | Expected result | Actual result |
|---|---|---|---|---|
| TC-01 | Backend startup | Start backend using the verified project command | Backend starts without an exception | Not run |
| TC-02 | Frontend startup | Run `npm install` and `npm run dev` in `frontend/` | Vite serves the application | Not run |
| TC-03 | API connectivity | Open the frontend and trigger a backend-backed view | Request reaches the configured API URL | Not run |
| TC-04 | Device listing | Open the device list or overview | Device data is displayed or a clear empty state appears | Not run |
| TC-05 | Trust evaluation | Submit a valid test device input using the supported interface | A result is returned in the documented schema | Not run |
| TC-06 | Invalid input | Submit missing or malformed fields in a safe test environment | Input is rejected or handled without crashing the service | Not run |
| TC-07 | Alerts | Exercise a test condition that the configured rules classify as suspicious | An alert appears if implemented for that condition | Not run |
| TC-08 | Analytics | Open analytics after test data exists | Metrics load or a clear empty state appears | Not run |
| TC-09 | Reports | Open reports and test supported export options | Report/export works for the configured data | Not run |
| TC-10 | Wokwi integration | Run the simulation and observe the configured backend integration | Data is received as expected by the implemented protocol | Not run |
| TC-11 | Authentication | Test valid and invalid login flows in a development environment | Access follows the configured authentication rules | Not run |
| TC-12 | Secrets hygiene | Search tracked files for credentials before publishing | No live credentials are committed | Not run |

## Test record template

- Date:
- Tester:
- Environment:
- Test ID:
- Result: Pass / Fail / Blocked
- Evidence or notes:
- Issue reference:
