import { Hono, Context } from 'hono'
import { ServerResponse } from 'node:http'
import { getTelegramTokens } from './utils'
import { Writable } from 'node:stream'
import { newTelegramBot } from './telegram'

const app = new Hono()

// admin auth
app.use('/admin/*', async (c: Context, next) => {
    // check header x-admin-auth
    const adminAuth = c.req.raw.headers.get("x-admin-auth");
    if (
        adminAuth && c.env.ADMIN_SECRET
        &&
        adminAuth.trim() == c.env.ADMIN_SECRET.trim()
    ) {
        return next();
    }
    return c.text("Need Admin Password", 401)
});

app.post("/telegram/webhook/:token_index", async (c) => {
    const { token_index } = c.req.param();
    const tokens = getTelegramTokens(c);
    const token = tokens[parseInt(token_index)];
    const bot = newTelegramBot(c, token);
    let body = null;
    const res = new Writable();
    Object.assign(res, {
        headersSent: false,
        setHeader: (name: string, value: string) => c.header(name, value),
        end: (data: any) => body = data,
    });
    const reqJson = await c.req.json();
    await bot.handleUpdate(reqJson, res as ServerResponse);
    return c.body(body);
});

app.get('/', (c) => {
    return c.html(`
<h1>cloudflare telegram bot</h1>
`);
});

app.post("/admin/init", async (c) => {
    const domain = new URL(c.req.url).host;
    const tokens = getTelegramTokens(c);
    for (const [index, token] of tokens.entries()) {
        const webhookUrl = `https://${domain}/telegram/webhook/${index}`;
        console.log(`setting webhook for ${index} to ${webhookUrl}`);
        const bot = newTelegramBot(c, token);
        await bot.telegram.setWebhook(webhookUrl)
    }
    return c.json({
        message: `webhooks set for ${tokens.length} bots`
    });
});

app.get("/admin/status", async (c) => {
    const tokens = getTelegramTokens(c);
    const res = [];
    for (const token of tokens) {
        const bot = newTelegramBot(c, token);
        const info = await bot.telegram.getWebhookInfo()
        res.push(info)
    }
    return c.json(res);
});

export default app
