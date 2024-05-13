
import { Telegraf, Context as TgContext } from "telegraf";
import { message } from "telegraf/filters";
import { Context } from "hono";


export function newTelegramBot(c: Context, token: string): Telegraf {
    const bot = new Telegraf(token);
    bot.command("ping", ctx => ctx.reply("pong"))
    bot.command("start", ctx => ctx.reply("type command se to use"))

    bot.command("ping", ctx => ctx.reply("pong"))
    bot.command("start", ctx => ctx.reply("type command se to use"))
    const send_awsl = async (ctx: TgContext) => {
        const res = await fetch(`${c.env.API_URL}/v2/random`)
        return await ctx.reply(await res.text())
    }
    bot.command("se", send_awsl)
    bot.command("sese", send_awsl)
    bot.command("awsl", send_awsl)

    const send_moyu = async (ctx: TgContext) => {
        const res = await fetch(c.env.MOYU_URL);
        return await ctx.reply(await res.text())
    }
    bot.command("moyu", send_moyu)
    bot.command("mo", send_moyu)
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
                    "Authorization": c.env.OPENAI_API_KEY,
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
        try {
            const response = await openai_chat(prompt)
            const reply = response?.choices[0]?.message?.content
            if (reply) {
                return await ctx.reply(reply)
            }
        } catch (error) {
            console.error(error)
        }
        const response = await c.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
            prompt: prompt
        });
        const reply = response?.result?.response;
        if (!reply) {
            console.error("Empty reply from AI")
            return
        }
        return await ctx.reply(reply)
    })

    return bot;
}
