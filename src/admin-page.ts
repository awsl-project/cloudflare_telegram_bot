export function renderAdminPageHtml(): string {
  return `
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloudflare Telegram Bot Admin</title>
  <style>
    body {
      font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
      max-width: 640px;
      margin: 32px auto;
      padding: 0 16px;
      background: #f8fafc;
      color: #0f172a;
    }
    .card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    }
    h1 {
      font-size: 20px;
      margin: 0 0 16px;
    }
    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    input {
      flex: 1;
      min-width: 220px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 14px;
    }
    button {
      border: 1px solid #0f172a;
      background: #0f172a;
      color: #fff;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
    }
    button.secondary {
      background: #fff;
      color: #0f172a;
    }
    #status {
      margin-top: 12px;
      color: #334155;
      font-size: 14px;
      min-height: 20px;
    }
    #result {
      margin-top: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 12px;
      min-height: 60px;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Bot 管理面板</h1>
    <div class="row">
      <input id="adminSecret" type="password" placeholder="输入 x-admin-auth 密钥" />
      <button id="initBtn" type="button">执行 Init</button>
    </div>
    <div id="status">等待操作...</div>
    <div id="result">{}</div>
  </div>

  <script>
    const storageKey = "admin_secret";
    const input = document.getElementById("adminSecret");
    const initBtn = document.getElementById("initBtn");
    const status = document.getElementById("status");
    const result = document.getElementById("result");

    function setStatus(message) {
      status.textContent = message;
    }

    function setJson(text) {
      result.textContent = text;
    }

    function pretty(text) {
      try {
        return JSON.stringify(JSON.parse(text), null, 2);
      } catch (_) {
        return text;
      }
    }

    async function fetchStatus(secret) {
      return await authedFetch("/admin/status", secret, "GET");
    }

    async function authedFetch(path, secret, method = "POST") {
      const res = await fetch(path, {
        method,
        headers: {
          "x-admin-auth": secret
        }
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || ("请求失败: " + res.status));
      }
      return text;
    }

    initBtn.addEventListener("click", async () => {
      const secret = input.value.trim();
      if (!secret) {
        setStatus("请先填写密码");
        setJson("{}");
        return;
      }
      localStorage.setItem(storageKey, secret);
      try {
        setStatus("正在执行 init...");
        await authedFetch("/admin/init", secret, "POST");
        const statusText = await fetchStatus(secret);
        setStatus("Init 成功");
        setJson(pretty(statusText));
      } catch (err) {
        setStatus("Init 失败");
        setJson(err && err.message ? err.message : String(err));
      }
    });

    const cached = localStorage.getItem(storageKey) || "";
    if (cached) {
      input.value = cached;
      setStatus("正在读取 /admin/status ...");
      fetchStatus(cached)
        .then((statusText) => {
          setStatus("已刷新 /admin/status");
          setJson(pretty(statusText));
        })
        .catch((err) => {
          setStatus("读取 /admin/status 失败");
          setJson(err && err.message ? err.message : String(err));
        });
    }
  </script>
</body>
</html>
`;
}
