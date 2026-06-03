# Using Google Civic Information API for County Officials

This project can automatically fetch real county official data from the Google Civic Information API.

## Setup

### 1. Get API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the "Civic Information API"
4. Create a service account or API key (recommend API key with application restrictions)
5. Copy your API key

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_GOOGLE_CIVICINFO_API_KEY=your_actual_api_key_here
```

### 3. Fetch Officials Data

Run the fetch script to download officials for all counties:

```bash
npm run fetch:officials
```

This will:
- Query Google Civic Information API for each county
- Fetch representatives at federal, state, and local levels
- Cache results in `public/data/county-officials.json`
- Display progress as it runs
- Fall back to mock data for any counties that fail

⚠️ **Note**: First-time fetch for all ~3,000 US counties may take 5-10 minutes due to API rate limiting.

### 4. Use in App

Once fetched, officials will automatically load from the cached data instead of mock data:

- When you select a county, real officials from Google's database will display
- The repository automatically falls back to mock data if `county-officials.json` is not available
- No API calls happen at runtime (all data is cached)

## Deployment

1. Generate officials data locally: `npm run fetch:officials`
2. Commit `public/data/county-officials.json` to version control
3. Do NOT commit `.env` - use environment variables in your deployment platform
4. App will work with or without live API data (graceful fallback)

## Troubleshooting

**"VITE_GOOGLE_CIVICINFO_API_KEY not set"**
- Make sure you created `.env` file with your API key

**"HTTP 403: Forbidden"**
- Check that your API key is correct
- Verify the Civic Information API is enabled in Google Cloud Console

**Slow / Timed out**
- The script respects rate limits (100ms between requests)
- You can restart it safely; it won't duplicate data
- Free tier allows 25,000 requests/day (enough for all US counties)

## Cost

✅ **Free** - Google provides 25,000 free queries per day through the free tier.

## API Data

Each official includes:
- Name
- Title/Office
- Party affiliation
- Email addresses
- Phone numbers
- Website URLs
- Photo URL
- Contact channels

Organized by government level:
- `federal` (Senators, Representatives)
- `state` (Governor, Senators, etc.)
- `county` (County officials)
- `local` (City/municipal officials)
