export type Bindings = {
    // bindings
    API_URL: string;
    MOYU_URL: string;
    BOT_NAME: string;
    OPENAI_API_URL: string;
    OPENAI_MODEL: string | undefined;
    // tokens
    TELEGRAM_BOT_TOKENS: string;
    OPENAI_API_KEY: string;
    ADMIN_SECRET: string;
    GREET_CHAT_IDS: string | undefined;
}

type HonoCustomType = {
    "Bindings": Bindings;
}
