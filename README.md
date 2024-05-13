# cloudflare telegram bot

use `cloudflare worker` and `telegraf` to create a telegram bot

## config

```bash
# modify wrangler.toml
cp wrangler.toml.template wrangler.toml
pnpm i
wrangler secret put TELEGRAM_BOT_TOKENS
wrangler secret put OPENAI_API_KEY
wrangler secret put ADMIN_SECRET
pnpm run deploy
```

## References

- https://github.com/Tsuk1ko/cfworker-middleware-telegraf
