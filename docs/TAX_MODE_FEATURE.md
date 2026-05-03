# Tax Mode Feature

## Overview

The tax mode feature allows administrators to enable/disable tax calculation for all orders through the settings page.

## Implementation

### UI Components

- **Toggle Switch**: Located in Settings > Pengaturan Pajak & Pesanan
- **Conditional Tax Percentage Field**: Only visible when tax mode is enabled
- **Clear Labels**: Indonesian labels with helpful descriptions

### Data Structure

```typescript
type SettingsSchema = {
  // ... other fields
  taxEnabled: boolean; // Toggle for tax mode
  taxPercentage: number; // Tax percentage (0-100)
  // ... other fields
};
```

### User Experience

1. **Tax Disabled**:
   - Toggle is OFF
   - Tax percentage field is hidden
   - No tax applied to orders

2. **Tax Enabled**:
   - Toggle is ON
   - Tax percentage field is visible and editable
   - Tax applied to all new orders based on percentage

### Architecture

Following the project's architecture patterns:

```
SettingsForm (Presentational)
    ↓
SettingsPage (Container)
    ↓
useSettings Hook (API + TanStack Query)
    ↓
API Route (/api/admin/settings)
    ↓
Settings Service
    ↓
Database
```

### Files Modified

- `lib/validations/settings.validation.ts` - Added `taxEnabled` field
- `components/settings/settings-form.tsx` - Added toggle UI and conditional rendering
- `app/d/settings/page.tsx` - Updated mock data
- `hooks/use-settings.ts` - Created settings hook (ready for API integration)

### Future Integration

When the backend API is ready:

1. Uncomment the hook usage in `SettingsPage`
2. Create the `/api/admin/settings` route
3. Create the settings service
4. Add database schema for settings storage

### Usage

Navigate to `/d/settings` and look for the "Pengaturan Pajak & Pesanan" section. The tax mode toggle allows enabling/disabling tax calculation with a clear, accessible interface.
