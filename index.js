import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// API criteria template for website development queries
const API_CRITERIA_TEMPLATE = `
When the user asks about APIs, website development, REST APIs, or backend development, respond with structured API criteria using this format:

### API Criteria Checklist

**1. Endpoint URL**
- Use nouns, not verbs (e.g., \`/api/users\` not \`/api/getUsers\`) [web:77]
- Example: \`GET /api/users/{id}\`

**2. HTTP Method**
- GET: Retrieve data [web:71][web:77]
- POST: Create new resource [web:71][web:77]
- PUT: Update entire resource [web:71]
- PATCH: Partial update [web:71]
- DELETE: Remove resource [web:71][web:77]

**3. Authentication**
- Required: API Key / OAuth2 / JWT [web:71]
- Never use roll-your-own auth [web:71]
- Always use HTTPS (no exceptions) [web:71]

**4. Request Body (JSON)**
\`\`\`json
{
  "field1": "value",
  "field2": "number"
}
\`\`\`
- Validate Content-Type header [web:71]
- Include required parameters [web:75]

**5. Response Format**
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Success"
}
\`\`\`
[web:75][web:77]

**6. Status Codes**
- 200: Success [web:71][web:77]
- 201: Created [web:71][web:77]
- 400: Bad Request [web:71][web:77]
- 401: Unauthorized [web:71][web:77]
- 404: Not Found [web:71][web:77]
- 500: Server Error [web:71][web:77]

**7. Rate Limiting**
- 60 req/min per IP for unauthenticated users [web:71]
- Include rate limit headers in response [web:71]

**8. Error Handling**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
\`\`\`
[web:71][web:77]

**9. Documentation**
- Provide OpenAPI 3.1 spec [web:71]
- Include request/response examples [web:75][web:76]
- Document all parameters and error scenarios [web:75]

**10. Best Practices**
- Version your API: \`/api/v1/users\` [web:71][web:77]
- Paginate large collections [web:71][web:77]
- Use consistent design patterns [web:74]
- Standardize error shapes [web:71][web:77]
- Design for idempotency [web:77]
- Observe everything (logs, metrics) [web:77]

---

Now respond to the user's question about APIs or website development using this criteria format. Make it practical and actionable.
`;

// Chat endpoint
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        // Check if query is about APIs or website development
        const apiKeywords = [
            "api", "rest api", "endpoint", "website development",
            "web development", "backend", "http method", "get post",
            "authentication", "status code", "rate limiting",
            "api documentation", "request body", "response"
        ];
        // Add website development template
        const WEBSITE_DEV_TEMPLATE = `
            When the user asks about website development, frontend, backend, or coding, respond with:

            **Practical coding help including:**
            - HTML/CSS/JavaScript examples
            - Framework recommendations (React, Vue, Node.js)
            - Design tips (UI/UX)
            - Best practices for performance
            - Security considerations
            - Deployment options

            Give clear, actionable code examples when possible.

            `;

        const isApiQuery = apiKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
        );

        let prompt = message;

        if (isApiQuery) {
            // Add API criteria template for API-related queries
            prompt = `${API_CRITERIA_TEMPLATE}\n\nUser Question: ${message}`;
        } else if (
            message.toLowerCase().includes("website") ||
            message.toLowerCase().includes("html") ||
            message.toLowerCase().includes("css") ||
            message.toLowerCase().includes("javascript") ||
            message.toLowerCase().includes("react") ||
            message.toLowerCase().includes("frontend") ||
            message.toLowerCase().includes("backend") ||
            message.toLowerCase().includes("code")
        ) {
            prompt = `${WEBSITE_DEV_TEMPLATE}\n\nUser Question: ${message}`;
        }




        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        return res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});