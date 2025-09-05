require("dotenv").config();


const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OAuth2Client } = require("google-auth-library");
const PORT = process.env.PORT || 8080;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "654883908647-8s6vjabqqjf8tsn3d90j14lrbklu596q.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = payload; // attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const app = express();
const PORT = 8080;

app.use(cors({
  origin: "https://vidya-mitra-frontend-eta.vercel.app/",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);





app.post("/api/chat", verifyGoogleToken, async (req, res) => {
  try {
    const { message } = req.body;
    const systemPrompt = `You are an expert career guidance counselor for Indian students.\n\nYour role is to help students in India explore career options based on their interests. \nStudents may type what excites them (e.g., "I love coding", "I enjoy helping people", "I like airplanes"). \nFrom their input, connect their passions to meaningful career paths in India.\n\nAlways keep answers:\n- Relevant to the Indian education system (JEE, NEET, UPSC, SSC, CA, CFA, IITs, AIIMS, etc.).\n- Friendly, encouraging, and easy for 15–25 year olds to understand.\n- Focused on practical advice.\n- Keep answers concise, under 4-5 short paragraphs. Avoid overwhelming lists unless specifically asked. Focus on giving clear, actionable next steps.\n\nAlways answer in this structured format:\n1. **Overview** – How their interest connects to careers.\n2. **Key Requirements** – Important exams, courses, or skills in India.\n3. **Career Opportunities** – At least 2–3 specific career options.\n4. **Suggested Next Steps** – Practical actions they can take now.\n\nStudent: ${message}`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
    });
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("❌ Gemini API Error:", error); // log full error
    res.status(500).json({
      error: "Gemini API request failed",
      details: error.message || error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
