import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Groq AI Service
export const getGroqResponse = async (messages) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    return {
      success: true,
      message: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model,
    };
  } catch (error) {
    console.warn("Groq API unavailable, using intelligent assistant engine:", error.message);
    const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
    const fallbackAnswer = generateFallbackResponse(lastUserMsg);

    return {
      success: true,
      fallback: true,
      message: fallbackAnswer,
      model: "rural-assistant-engine-v1",
      usage: { prompt: 50, completion: 120, total: 170 },
    };
  }
};

const generateFallbackResponse = (query = "") => {
  const q = query.toLowerCase();

  if (q.includes("attendance") || q.includes("present") || q.includes("absent") || q.includes("mark")) {
    return "To mark your daily attendance:\n\n1. Go to the **Attendance** section from the sidebar.\n2. Allow location access so your worksite coordinates can be verified.\n3. Complete the photo scan / biometric verification.\n4. Click **Confirm Check-In** in the morning (8:00 AM - 9:30 AM) and **Check-Out** before leaving.\n\nYour attendance is automatically validated and sent to your Panchayat supervisor for approval.";
  }

  if (q.includes("payment") || q.includes("salary") || q.includes("wage") || q.includes("money") || q.includes("bank") || q.includes("dbt")) {
    return "Here is how wages and payments work on Rural Employment Hub:\n\n- **Daily Wage**: Ranges between ₹290 - ₹350 per day depending on the work category.\n- **Payment Cycle**: Wages are calculated every 15 to 30 days based on verified attendance.\n- **Direct Benefit Transfer (DBT)**: Payments are credited straight to your registered Aadhaar-linked bank account.\n- **Receipts**: You can view and download itemized digital salary slips under the **Payments** tab.";
  }

  if (q.includes("assignment") || q.includes("work") || q.includes("job") || q.includes("project")) {
    return "For work assignments and projects:\n\n- Visit the **Work Assignments** page to view available village projects like road paving, canal desilting, and community ponds.\n- You can click **Accept** to confirm your participation in an assigned project.\n- Each project specifies the location, daily wage rate, duration, and assigned team members.";
  }

  if (q.includes("scheme") || q.includes("mgnrega") || q.includes("benefit") || q.includes("government")) {
    return "Key Rural Employment & Welfare Schemes available:\n\n1. **MGNREGS**: Guarantees at least 100 days of wage employment in a financial year to rural households.\n2. **PM-KISAN**: Provides income support of ₹6,000 per year in three equal installments.\n3. **Pradhan Mantri Awas Yojana (Gramin)**: Financial assistance for housing construction.\n4. **Rural Skill Development**: Free vocational training workshops organized through the Mandal Development Office.";
  }

  if (q.includes("profile") || q.includes("aadhaar") || q.includes("bank account") || q.includes("phone")) {
    return "To update your profile and banking details:\n\n- Navigate to **My Profile** from the sidebar or navbar.\n- You can verify your 12-digit Aadhaar number, update your Bank Name, Account Number, and IFSC Code for DBT wage transfers.\n- Ensure your registered mobile phone number is active for SMS payment alerts.";
  }

  return "Namaste! I am your Rural Employment Hub Assistant. I can assist you with:\n\n- **Marking Attendance** & biometric verification\n- **Checking Wage Payments** and salary receipts\n- **Accepting Work Assignments** in your gram panchayat\n- **Understanding Government Schemes** (MGNREGS, PM-KISAN)\n- **Updating Bank & Aadhaar Details**\n\nHow can I assist you with your employment today?";
};

// System Prompt for Rural Employment Hub Chatbot
export const getSystemPrompt = () => {
  return `You are an AI Assistant for Rural Employment Hub, a digital platform designed to help rural workers manage their employment, attendance, and payments.

Your role is to:
1. Answer questions about employment registration and job opportunities
2. Provide information about attendance tracking and verification methods
3. Explain payment processes and wage calculations
4. Guide users through work assignments
5. Help with account and profile management
6. Provide information about government rural employment schemes
7. Answer FAQs about the platform
8. Be supportive and encouraging to rural workers

Important Guidelines:
- Always be respectful and supportive
- Use simple, clear language
- If you don't know something, admit it and suggest contacting the admin
- For legal or financial advice, recommend speaking with authorities
- Be helpful and patient
- Keep responses concise but informative
- If asked about specific account details, advise checking the platform directly

Common Topics You Can Help With:
- Employee registration and ID generation
- Attendance methods (face recognition, fingerprint, biometric)
- Payment tracking and salary calculations
- Work assignments and job locations
- Notifications and updates
- Schemes and benefits
- Troubleshooting common issues`;
};

// Format messages for API
export const formatMessages = (userMessage, conversationHistory = []) => {
  const messages = [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  return messages;
};

// Parse streaming response (if needed for future implementation)
export const parseStreamingResponse = (stream) => {
  return stream;
};
