# Cloudflare DNS Checklist

Contoh subdomain:

- `pos.yourdomain.com` -> Vercel frontend
- `api.yourdomain.com` -> Render API

Checklist:

1. Tambahkan domain frontend ke Vercel, lalu ikuti DNS record yang diminta Vercel.
2. Tambahkan custom domain API ke Render, lalu ikuti DNS record yang diminta Render.
3. Pastikan SSL/TLS Cloudflare minimal `Full`.
4. Jika API memakai custom domain, update:
   - Vercel `VITE_API_URL=https://api.yourdomain.com/api`
   - Render `CORS_ORIGIN=https://pos.yourdomain.com`
5. Jangan cache endpoint `/api/*` di Cloudflare.
