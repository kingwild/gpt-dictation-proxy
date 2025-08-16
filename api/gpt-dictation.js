const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/api/gpt-dictation", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "你是英语老师，只能回复一个严格符合以下结构的 JSON 字符串：{\"en\": \"英文句子\", \"zh\": \"中文翻译\"}。不能添加任何解释、提示、标点、空行或代码块等多余内容，必须严格符合结构且字段完整。"
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    const match = text.match(/{[\s\S]*}/);
    if (!match) return res.status(400).json({ error: "No valid JSON found" });

    const parsed = JSON.parse(match[0]);
    if (!parsed.en || !parsed.zh) return res.status(400).json({ error: "Missing en or zh field" });

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;