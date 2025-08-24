require("dotenv").config();


const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    console.log("🔍 Raw OpenAI Response:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Invalid response from OpenAI API", details: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


