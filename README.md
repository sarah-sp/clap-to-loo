# Clap To Loo

Live train departure times from Clapham Junction to London Waterloo (and back).

**[clap-to-loo.vercel.app](https://clap-to-loo.vercel.app)**

## Features

- Real-time departures from National Rail Darwin API
- Toggle between Clapham Junction → Waterloo and Waterloo → Clapham Junction
- Filter by platform
- Shows minutes until departure (accounts for delays)
- Auto-refreshes every 60 seconds (pauses when app is backgrounded)
- TfL-inspired design
- PWA support - add to iPhone home screen for app-like experience

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- National Rail LDBWS API (via SOAP)
- Deployed on Vercel

## Setup

1. Get a free API token from [National Rail Open Data](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)

2. Clone and install:
   ```bash
   git clone https://github.com/sarah-sp/clap-to-loo.git
   cd clap-to-loo
   npm install
   ```

3. Add your token to `.env.local`:
   ```
   DARWIN_TOKEN=your-token-here
   ```

4. Run:
   ```bash
   npm run dev
   ```

## Deploy

Deploy to Vercel and add `DARWIN_TOKEN` as an environment variable.

## Why "Clap To Loo"?

Clap(ham Junction) To (Water)loo.
