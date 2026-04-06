# ShieldPay (lab demo)

ShieldPay is a **full-stack demo** for a secure-coding lab. It intentionally ships with a vulnerable baseline so students can use **Arko (DevSecAI) in Cursor** to find and fix issues.

## Run (dev)

```bash
cd shieldpay
npm install
npm run dev
```

- App: `http://127.0.0.1:8788`
- Health: `curl http://127.0.0.1:8788/api/health`
- Seeded demo merchant login: **merchant@demo.com** / **Demo1234!**

## Run (prod)

```bash
cd shieldpay
npm install
npm run build
npm start
```

If `frontend/dist` is missing, `npm start` exits with a clear error.

## Env

Copy `.env.example` to `.env` and adjust if needed.

## Lab vulnerabilities

The baseline includes **ARKO-LAB-01 … ARKO-LAB-09** markers in code comments.

