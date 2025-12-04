# Sub-Prism

A lightweight ETL middleware for managing and distributing proxy node subscriptions via Cloudflare R2.

## Features

- 🔄 Parse and transform proxy node links (vless, vmess, etc.)
- 👥 Route nodes to different users based on regex matching
- 🏷️ Rename node labels using hostname-based mapping
- ☁️ Upload per-user subscriptions to Cloudflare R2
- 📊 Generate CSV reports with subscription links

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Cloudflare R2 credentials:
- `CF_ACCOUNT_ID` - Your Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 API access key
- `R2_SECRET_ACCESS_KEY` - R2 API secret key
- `R2_BUCKET_NAME` - Your R2 bucket name
- `R2_PUBLIC_DOMAIN` - Public domain for your R2 bucket
- `FILENAME_SALT` - Random string for secure filename generation

### 3. Configure mappings

```bash
cp config.example.ts config.ts
```

Edit `config.ts`:
- `SERVER_MAP` - Map hostnames to display labels
- `USER_MAP` - Map usernames to regex patterns for matching
- `RAW_NODE_LINKS` - Paste your node links here

### 4. Run

```bash
pnpm start
```

Results will be saved to the `results/` directory.

## How It Works

```
Input Links → Parse → Match User (regex) → Transform Label → Upload to R2 → Generate Report
```

1. **Extract**: Parse raw node links from `RAW_NODE_LINKS`
2. **Transform**: Match users via regex, rename labels via `SERVER_MAP`
3. **Load**: Upload base64-encoded subscriptions to R2
4. **Report**: Generate CSV with user, regex, subscription URL, and node count

## License

MIT
