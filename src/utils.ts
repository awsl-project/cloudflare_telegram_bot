import { Context } from "hono";

export const getTelegramTokens = (c: Context): Array<string> => {
    if (!c.env.TELEGRAM_BOT_TOKENS) {
        return [];
    }
    if (typeof c.env.TELEGRAM_BOT_TOKENS === "string") {
        try {
            const tokens = c.env.TELEGRAM_BOT_TOKENS as string;
            return tokens.split(",");
        } catch (e) {
            console.error("Failed to parse TELEGRAM_BOT_TOKENS", e);
            return [];
        }
    }
    if (Array.isArray(c.env.TELEGRAM_BOT_TOKENS)) {
        return c.env.TELEGRAM_BOT_TOKENS;
    }
    console.error("Failed to parse TELEGRAM_BOT_TOKENS");
    return [];
}
