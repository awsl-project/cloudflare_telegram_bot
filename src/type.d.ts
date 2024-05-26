export type Bindings = {
    // bindings
    AI: Ai;
    API_URL: string;
    MOYU_URL: string;
    UOMG_URL: string;
    BOT_NAME: string;
    OPENAI_API_URL: string;
    // tokens
    TELEGRAM_BOT_TOKENS: string;
    OPENAI_API_KEY: string;
    ADMIN_SECRET: string;
}

type HonoCustomType = {
    "Bindings": Bindings;
}
