# 🛡️ ShieldPay: AI Security Audit & Remediation

A full-stack React and Node.js payment dashboard built to demonstrate the application-layer security risks of AI-generated code, and the DevSecOps loop required to secure it.

**Tech Stack:** React 18, Vite, Node.js, Express, SQLite (better-sqlite3)
**Security Tools:** ARKO (DevSecAI), Cursor
**Focus Areas:** OWASP Top 10, PCI DSS compliance patterns, RBAC, Data Redaction

> **Note:** This is a security lab environment. All PII, credit card PANs, and transactions are seeded dummy data. 

## 🚨 The Reality of AI-Generated Code
AI models are highly optimized to write functional code, but they frequently fail at secure coding. To test this, I prompted an AI agent to build a multi-merchant payment platform from scratch. 

While the functional build was incredibly fast, a static analysis scan using the **ARKO** security tool revealed a massive reality check. 

![ARKO 77% Hackable Score](assets/arko-score.png)

The AI had introduced 10 critical and high-severity vulnerabilities right out of the gate, directly mapping to the OWASP Top 10:

<div align="center">
  <img src="assets/arko-criticals.png" width="45%" alt="ARKO Critical Findings">
  <img src="assets/arko-highs.png" width="45%" alt="ARKO High Findings">
</div>

* **Critical:** SQL Injection in search parameters.
* **Critical:** Missing Admin Role Checks (Broken Access Control).
* **High:** PCI DSS Violations (Sensitive Payment Card Data Exposure).
* **High:** Hardcoded JWT secrets & fallback session keys.
* **High:** IDOR (Customer Update/Deletion without Ownership Verification).
* **Medium:** XSS escalation risks (JWTs stored in browser `localStorage`).

## 🛠️ The DevSecOps Loop (Build → Scan → Fix)
Using ARKO's findings, I manually audited the vulnerable endpoints and refactored the backend to enforce strict data protection and access controls.

### Example Remediation: SQL Injection
The AI originally generated backend search endpoints using raw string concatenation, exposing the entire database to injection attacks.

**❌ Vulnerable Baseline (AI-Generated)**
```javascript
// ARKO-LAB-01: SQL Injection vulnerability
app.get('/api/transactions', (req, res) => {
  const search = req.query.search
  const results = db.prepare(
    "SELECT * FROM transactions WHERE description LIKE '%" + search + "%'"
  ).all()
  res.json(results)
})

✅ Secured (Audited & Patched)

// Remediated: Implemented Parameterized Queries & Input Sanitization
app.get('/api/transactions', (req, res) => {
  const search = sanitizeSearchInput(req.query.search);
  const results = db.prepare(
    "SELECT * FROM transactions WHERE description LIKE ?"
  ).all(`%${search}%`); // Variables bound securely by sqlite3
  res.json(results)
})

🔐 Key Security Architecture Improvements

1. API Tokenization (PCI DSS Mitigation): Replaced plaintext PANs in API responses with stable, HMAC-SHA256 derived tokens (tok_...). Full card numbers are no longer transmitted back to the client.

2. Session Hardening: Migrated JWTs out of localStorage (which is vulnerable to XSS) and implemented secure, httpOnly, SameSite=Lax cookies.

3. Access Control (RBAC): Built robust requireAdmin middleware enforcing strict role-based gating across all /api/admin/.*routes.

4. Secrets Management: Stripped all guessable fallback secrets (e.g., shieldpay-secret) and enforced strict startup validation (initAuthSecrets()) requiring cryptographically strong environment variables.

5. Cryptography: Replaced the insecure JWT-based password reset flow with a secure table utilizing temporary, one-time SHA-256 hashed tokens.

Run Locally

npm install
npm run dev