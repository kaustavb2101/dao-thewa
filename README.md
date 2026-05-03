# โหงวเฮ้ง — ดาวเทวา

> Thai-Chinese Five Elements (五行相法) face reading, powered by Claude AI Vision.

## What it does

Upload a face photo → Claude Vision analyzes facial features → Get a full **โหงวเฮ้ง** reading:
- Dominant element (Wood / Fire / Earth / Metal / Water)
- 5-zone breakdown (forehead, brows, eyes, nose, mouth/chin)
- Strengths, challenges, lucky color/number/direction
- Career, wealth & health advice — all in Thai

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kaustavb2101/dao-thewa/tree/web-deploy&env=ANTHROPIC_API_KEY&envDescription=Your+Anthropic+API+key+for+Claude+Vision&envLink=https://console.anthropic.com)

**Manual steps:**
1. Fork / clone this branch
2. `npm install`
3. Add `ANTHROPIC_API_KEY` in `.env.local`
4. `npm run dev`

## Stack

- **Next.js 14** (App Router)
- **Claude claude-sonnet-4-6** Vision via `@anthropic-ai/sdk`
- Zero external UI dependencies — all inline styles

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Required. Get from [console.anthropic.com](https://console.anthropic.com) |
