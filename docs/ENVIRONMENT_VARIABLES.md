# Environment Variables Guide

Complete guide to all environment variables used in this project.

## Required Variables

### Database

```env
DATABASE_URL='postgresql://user:password@host/database'
```

PostgreSQL connection string (Neon recommended).

### Authentication

```env
JWT_SECRET='your-secret-key-here'
JWT_REFRESH_SECRET='your-refresh-secret-here'
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

- `JWT_SECRET` - Used to sign authentication tokens
- `JWT_REFRESH_SECRET` - Used for refresh token rotation
- `NEXT_PUBLIC_APP_URL` - Your app's public URL

### Payment (Midtrans)

```env
MIDTRANS_SERVER_KEY='SB-Mid-server-YOUR_KEY'
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY='SB-Mid-client-YOUR_KEY'
```

- `MIDTRANS_SERVER_KEY` - Backend only, never exposed to frontend
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` - Used by Snap.js in browser

**Auto-detection:**

- Keys starting with `SB-` = Sandbox mode
- Keys without `SB-` = Production mode

### Shipping (RajaOngkir)

```env
RAJAONGKIR_API_KEY='your-api-key'
RAJAONGKIR_ORIGIN_DISTRICT_ID='1360'
RAJAONGKIR_BASE_URL='https://rajaongkir.komerce.id/api/v1'
```

- `RAJAONGKIR_API_KEY` - Your RajaOngkir API key
- `RAJAONGKIR_ORIGIN_DISTRICT_ID` - Your warehouse district ID
- `RAJAONGKIR_BASE_URL` - API endpoint (usually doesn't change)

### Email (Resend)

```env
RESEND_API_KEY='re_your_api_key'
```

Used for sending transactional emails.

### File Storage (Vercel Blob)

```env
BLOB_READ_WRITE_TOKEN='vercel_blob_your_token'
```

For product image uploads.

## Environment-Specific Setup

### Development (.env)

```env
# Database
DATABASE_URL='postgresql://localhost/mydb'

# Auth
JWT_SECRET='dev-secret-change-in-production'
JWT_REFRESH_SECRET='dev-refresh-secret'
NEXT_PUBLIC_APP_URL='http://localhost:3000'

# Payment (Sandbox)
MIDTRANS_SERVER_KEY='SB-Mid-server-xxx'
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY='SB-Mid-client-xxx'

# Shipping
RAJAONGKIR_API_KEY='your-key'
RAJAONGKIR_ORIGIN_DISTRICT_ID='1360'
RAJAONGKIR_BASE_URL='https://rajaongkir.komerce.id/api/v1'

# Email
RESEND_API_KEY='re_xxx'

# Storage
BLOB_READ_WRITE_TOKEN='vercel_blob_xxx'
```

### Production

```env
# Database
DATABASE_URL='postgresql://production-host/db'

# Auth
JWT_SECRET='strong-random-secret-256-bits'
JWT_REFRESH_SECRET='another-strong-secret'
NEXT_PUBLIC_APP_URL='https://yourdomain.com'

# Payment (Production)
MIDTRANS_SERVER_KEY='Mid-server-xxx'  # No SB- prefix
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY='Mid-client-xxx'  # No SB- prefix

# Shipping
RAJAONGKIR_API_KEY='your-production-key'
RAJAONGKIR_ORIGIN_DISTRICT_ID='1360'
RAJAONGKIR_BASE_URL='https://rajaongkir.komerce.id/api/v1'

# Email
RESEND_API_KEY='re_production_key'

# Storage
BLOB_READ_WRITE_TOKEN='vercel_blob_production'
```

## Variable Naming Convention

### Public vs Private

**Private (Backend only):**

- No prefix
- Never sent to browser
- Examples: `MIDTRANS_SERVER_KEY`, `JWT_SECRET`

**Public (Frontend accessible):**

- Prefix: `NEXT_PUBLIC_`
- Bundled into client JavaScript
- Examples: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_APP_URL`

### Security Rules

1. **Never commit `.env` to git** - Use `.env.example` instead
2. **Rotate secrets regularly** - Especially JWT secrets
3. **Use strong random values** - For JWT secrets (256+ bits)
4. **Separate sandbox/production** - Never mix credentials
5. **Limit public variables** - Only expose what's necessary

## Getting API Keys

### Midtrans

1. Sign up at [midtrans.com](https://midtrans.com)
2. Go to Settings > Access Keys
3. Copy Server Key and Client Key
4. Use Sandbox keys for testing

### RajaOngkir

1. Sign up at [rajaongkir.com](https://rajaongkir.com)
2. Get API key from dashboard
3. Find your district ID using their API

### Resend

1. Sign up at [resend.com](https://resend.com)
2. Create API key in dashboard
3. Verify your domain for production

### Vercel Blob

1. Create project on [vercel.com](https://vercel.com)
2. Go to Storage > Create Blob Store
3. Copy the read/write token

## Troubleshooting

### "Environment variable not found"

- Check variable name spelling
- Restart dev server after adding variables
- For `NEXT_PUBLIC_*` vars, rebuild the app

### "Invalid API key"

- Verify key is correct in dashboard
- Check for extra spaces or quotes
- Ensure using correct environment (sandbox vs production)

### "CORS error" or "Unauthorized"

- Check `NEXT_PUBLIC_APP_URL` matches your domain
- Verify API keys are for correct environment
- Check API key permissions in provider dashboard

## Validation

Check if all required variables are set:

```bash
# Check backend variables
node -e "
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'MIDTRANS_SERVER_KEY',
  'RAJAONGKIR_API_KEY',
  'RESEND_API_KEY',
  'BLOB_READ_WRITE_TOKEN'
];
required.forEach(key => {
  console.log(key + ':', process.env[key] ? '✓' : '✗ MISSING');
});
"

# Check frontend variables (after build)
# These should be in your .env.local or .env
echo "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: ${NEXT_PUBLIC_MIDTRANS_CLIENT_KEY:+✓}"
echo "NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:+✓}"
```

## Best Practices

1. **Use `.env.local` for local overrides** - Not tracked by git
2. **Document all variables** - Update `.env.example` when adding new ones
3. **Use different keys per environment** - Don't reuse production keys in dev
4. **Set up CI/CD secrets** - Store production vars in deployment platform
5. **Monitor API usage** - Track usage of paid services (Midtrans, RajaOngkir, etc.)

## Summary

**Total Variables: 10**

- Required: 10
- Optional: 0
- Public (NEXT*PUBLIC*\*): 2
- Private: 8

**Simplified from original:**

- Removed `MIDTRANS_CLIENT_KEY` (unused)
- Removed `MIDTRANS_IS_PRODUCTION` (auto-detected)
- Removed `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` (auto-detected)
