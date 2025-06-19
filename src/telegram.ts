
import { Telegraf, Context as TgContext } from "telegraf";
import { message } from "telegraf/filters";
import { Context } from "hono";

import { HonoCustomType } from "./type";

const COMMANDS = [
    {
        command: "start",
        description: "开始使用"
    },
    {
        command: "awsl",
        description: "awsl 随机一图"
    },
    {
        command: "moyuban",
        description: "摸鱼办提醒"
    },
    {
        command: "mjx",
        description: "买家秀随机一图"
    },
    {
        command: "chatgpt",
        description: "和AI聊天, 例如 /chatgpt 你好"
    }
]


export function newTelegramBot(c: Context<HonoCustomType>, token: string): Telegraf {
    const bot = new Telegraf(token);

    bot.use(async (ctx, next) => {
        try {
            await next();
        } catch (error) {
            console.error(`Error: ${error}`);
            return await ctx.reply(`Error: ${error}`);
        }
    })

    bot.command("ping", ctx => ctx.reply("pong"))

    bot.command("start", ctx => ctx.reply(
        "欢迎使用本机器人\n\n" +
        COMMANDS.map(c => `/${c.command}: ${c.description}`).join("\n")
    ))

    bot.on(message("new_chat_members"), async (ctx: TgContext) => {
        // @ts-ignore
        const chatId = ctx?.message?.chat?.id;
        if (!chatId) { return; }
        if (ctx.chat?.type == "private") { return; }
        const greetChatIds = c.env.GREET_CHAT_IDS?.split(",") || [];
        if (!greetChatIds.includes(chatId.toString())) { return; }
        return await ctx.reply(`欢迎新成员加入本群！`);
    });

    const send_awsl = async (ctx: TgContext) => {
        const res = await fetch(`${c.env.API_URL}/v2/random`)
        return await ctx.reply(await res.text())
    }
    bot.command("awsl", send_awsl)

    const send_moyu = async (ctx: TgContext) => {
        const res = await fetch(c.env.MOYU_URL);
        return await ctx.reply(await res.text())
    }
    bot.command("moyuban", send_moyu)

    const send_mjx = async (ctx: TgContext) => {
        const res = await fetch(c.env.UOMG_URL)
        const data = await res.json() as { imgurl: string }
        return await ctx.reply(data["imgurl"])
    }

    bot.command("maijiaxiu", send_mjx)
    bot.command("mjx", send_mjx)

    async function openai_chat(prompt: string): Promise<any> {
        const response = await fetch(
            `${c.env.OPENAI_API_URL}/v1/chat/completions`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${c.env.OPENAI_API_KEY}`,
                },
                method: "POST",
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                }),
            }
        )
        const result = await response.json()
        return result
    }

    bot.command("chatgpt", async (ctx: TgContext) => {
        // @ts-ignore
        const prompt = ctx?.message?.text.slice("/chatgpt".length).trim();
        if (!prompt || prompt.length === 0) {
            return await ctx.reply("请输入聊天内容")
        }
        return await aicommand(ctx, prompt)
    });

    bot.on(message('text'), async (ctx: TgContext) => {
        // @ts-ignore
        if (!ctx?.message?.text?.startsWith(c.env.BOT_NAME)) {
            return
        }
        // @ts-ignore
        const prompt = ctx.message.text.slice(c.env.BOT_NAME.length).trim();
        if (!prompt || prompt.length === 0) {
            console.error("Empty prompt")
            return
        }
        return await aicommand(ctx, prompt)
    });

    const aicommand = async (ctx: TgContext, prompt: string) => {
        try {
            const response = await openai_chat(prompt)
            const reply = response?.choices[0]?.message?.content
            if (reply) {
                return await ctx.reply(reply, {
                    parse_mode: "Markdown"
                })
            }
        } catch (error) {
            console.error(error)
        }
        const response = await c.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
            prompt: prompt
        }) as { response: string };
        const reply = response?.response;
        if (!reply) {
            console.error("Empty reply from AI")
            return
        }
        return await ctx.reply(reply)
    }

    return bot;
}

export async function initTelegramBotCommands(bot: Telegraf) {
    await bot.telegram.setMyCommands(COMMANDS);
}
