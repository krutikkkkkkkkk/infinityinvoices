# Multi-Currency Dashboard Configuration

## Overview
The Infinity Invoice app now supports multi-currency configuration at the dashboard level. Users can set their preferred default currency in the settings, which will auto-populate when creating new invoices.

## What's Been Configured

### 1. Database Schema (Migration)
- **File**: `scripts/add-default-currency.sql`
- **Changes**: Added `default_currency` column to the `profiles` table with a CHECK constraint ensuring only valid currencies are stored (INR, USD, EUR, GBP, CAD, AUD, JPY, CNY, CHF, SGD, AED, SAR, MXN, BRL, ZAR)

### 2. Type Definitions
- **File**: `lib/types.ts`
- **Changes**: Added `default_currency?: Currency` to the Profile interface to store user's preferred currency

### 3. Settings Page
- **File**: `components/dashboard/settings-form.tsx`
- **Changes**:
  - Added `default_currency` field to form state
  - Created a new currency selector dropdown in the "Financial Settings" section
  - Updated the submit handler to persist the selected currency to the database
  - Currency dropdown displays all 15 supported currencies with symbols and labels

### 4. Document Form
- **File**: `components/dashboard/document-form.tsx`
- **Changes**: Updated the currency initialization to use `profile?.default_currency` as fallback when creating new documents

## Supported Currencies

The app supports 15 currencies:
- **INR** - Indian Rupee (₹)
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **CAD** - Canadian Dollar (C$)
- **AUD** - Australian Dollar (A$)
- **JPY** - Japanese Yen (¥)
- **CNY** - Chinese Yuan (¥)
- **CHF** - Swiss Franc (CHF)
- **SGD** - Singapore Dollar (S$)
- **AED** - UAE Dirham (د.إ)
- **SAR** - Saudi Riyal (﷼)
- **MXN** - Mexican Peso (MX$)
- **BRL** - Brazilian Real (R$)
- **ZAR** - South African Rand (R)

## How to Deploy

1. **Run the migration** in your Supabase database:
   ```sql
   -- Copy and run the contents of scripts/add-default-currency.sql
   ```

2. **Deploy the code** to your production environment using the updated components and types.

## User Flow

1. User goes to **Dashboard → Settings**
2. Scroll to **Financial Settings** section
3. Select preferred **Default Currency** from dropdown
4. Click **Save Changes**
5. When creating new invoices, the selected currency will be pre-filled

## Features

✅ **User-level currency preference** - Each user can set their own default currency
✅ **Auto-fill on new documents** - New invoices/quotations use the default currency
✅ **Override per document** - Users can still change currency for individual documents
✅ **Revenue calculations** - Dashboard respects multi-currency with EXCHANGE_RATES_TO_INR for reporting
✅ **Currency converter tool** - Available at `/dashboard/tools/currency-converter` for quick conversions

## Technical Details

- **Database**: Currency stored as TEXT with CHECK constraint
- **Frontend validation**: TypeScript ensures only valid Currency type values
- **Default value**: Falls back to 'INR' if not set
- **UI/UX**: Clean dropdown with currency symbols and full names for easy selection

## Future Enhancements

Consider implementing:
- Real-time exchange rates for multi-currency revenue reporting
- Currency-specific number formatting in dashboard widgets
- Exchange rate settings for more accurate revenue conversion
- Currency preference for each client (auto-select based on client's country)
