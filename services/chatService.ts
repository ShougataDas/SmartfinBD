import { ChatMessage, ChatResponse, User, FinancialProfile } from "@/types";
import { API_CONFIG, getApiUrl } from "@/constants/config";
import { useAuthStore } from "@/store/authStore";

/**
 * AI Chat Service
 * Handles communication with OpenAI API for financial advice and support
 */

export class ChatService {
  private static readonly API_URL =
    "https://api.openai.com/v1/chat/completions";
  private static readonly MODEL = "gpt-3.5-turbo";
  private static readonly MAX_TOKENS = 1000;
  private static readonly API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  /**
   * Get system prompt for financial advisor
   */
  private static getSystemPrompt(
    user?: User,
    financialProfile?: FinancialProfile
  ): string {
    const userContext =
      user && financialProfile
        ? `
User Profile:
- Name: ${user.name}
- Age: ${user.age}
- Monthly Income: ${financialProfile.monthlyIncome} BDT
- Monthly Expenses: ${financialProfile.monthlyExpenses} BDT
- Current Savings: ${financialProfile.currentSavings} BDT
- Dependents: ${financialProfile.dependents}
- Employment: ${financialProfile.employmentType}
- Income Stability: ${financialProfile.incomeStability}
- Risk Tolerance: ${user.riskTolerance || "Not assessed"}
`
        : "";

    return `You are SmartFin BD Assistant, an expert financial advisor specializing in Bangladesh's financial market and investment options. You provide personalized financial advice in both Bengali and English.

${userContext}

Key Guidelines:
1. Always respond in the same language the user asks (Bengali or English)
2. Focus on Bangladesh-specific investment options: Sanchayapatra, DPS, Fixed Deposits, Mutual Funds, Stock Market (DSE), Government Bonds
3. Consider Bangladesh's economic context, inflation rates, and local financial regulations
4. Provide practical, actionable advice suitable for Bangladeshi investors
5. Be culturally sensitive and use appropriate local examples
6. Always emphasize the importance of emergency funds and diversification
7. Mention relevant tax implications in Bangladesh
8. Keep responses concise but informative (max 300 words)
9. If asked about specific stocks or companies, remind users to do their own research
10. Always include disclaimers about investment risks
11. Use emojis and bullet points to make responses more engaging

Available Investment Options in Bangladesh:
- Sanchayapatra (Government Savings Certificates): 8-11% annual return, very safe
- DPS (Deposit Pension Scheme): 6-8% annual return, safe, good for regular savings
- Fixed Deposits: 5-7% annual return, very safe, short-term
- Mutual Funds: 8-15% potential return, moderate risk, professional management
- Stock Market (DSE): 10-20% potential return, high risk, requires knowledge
- Government Bonds: 7-9% annual return, safe, higher minimum investment

Current Economic Context:
- Inflation rate: ~6-9%
- Bank interest rates: 5-8%
- GDP growth: ~6-7%
- Currency: Bangladeshi Taka (BDT)

Always end responses with a helpful tip or encouragement about financial planning.`;
  }

  /**
   * Send message to API
   */
  static async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    user?: User,
    financialProfile?: FinancialProfile
  ): Promise<ChatResponse> {
    try {
      // Get the last 10 messages for context
      const recentMessages = conversationHistory.slice(-10);

      // Get auth token
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Group messages into question-answer pairs
      const messagePairs: { question: string; answer: string }[] = [];
      let currentQuestion = "";
      let currentAnswer = "";

      for (const msg of recentMessages) {
        const isUserMessage = msg.isUser || msg.userId !== "ai_assistant";
        const messageText = msg.text || msg.content || "";

        if (isUserMessage) {
          // If we have a previous question-answer pair, save it
          if (currentQuestion && currentAnswer) {
            messagePairs.push({
              question: currentQuestion,
              answer: currentAnswer,
            });
          }
          // Start new question
          currentQuestion = messageText;
          currentAnswer = "";
        } else {
          // This is an AI response
          currentAnswer = messageText;
        }
      }

      // Add the last pair if it exists
      if (currentQuestion && currentAnswer) {
        messagePairs.push({
          question: currentQuestion,
          answer: currentAnswer,
        });
      }

      // Take only the last 5 pairs
      const lastFivePairs = messagePairs.slice(-5);

      // Prepare request body
      const requestBody = {
        question: message,
        recentMessage: lastFivePairs,
      };

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHAT.SEND), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(
          `Chat API error: ${response.status} ${response.statusText}`
        );
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response from chat API");
      }

      return {
        success: true,
        message: data.data.answer,
      };
    } catch (error) {
      console.error("Chat service error:", error);

      // Return fallback response
      return {
        success: true,
        message: this.getFallbackResponse(message),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get fallback response when API is unavailable
   */
  private static getFallbackResponse(userMessage: string): string {
    const isBengali = this.isBengaliMessage(userMessage);
    const lowerMessage = userMessage.toLowerCase();

    if (isBengali) {
      // Bengali responses for common topics
      if (
        lowerMessage.includes("সঞ্চয়পত্র") ||
        lowerMessage.includes("sanchayapatra")
      ) {
        return `🏦 **সঞ্চয়পত্র** বাংলাদেশ সরকারের একটি অত্যন্ত নিরাপদ বিনিয়োগ মাধ্যম।

✅ **মূল বৈশিষ্ট্য:**
• বার্ষিক ৮.৫-১১% সুদ
• সরকারি গ্যারান্টি ১০০%
• মাসিক/ত্রৈমাসিক সুদ প্রদান
• ৫ লক্ষ টাকা পর্যন্ত ৫% কর

💡 **টিপ:** আপনার বয়স ও আয় অনুযায়ী পরিবার বা পেনশনার সঞ্চয়পত্র বেছে নিন।`;
      }

      if (
        lowerMessage.includes("মিউচুয়াল ফান্ড") ||
        lowerMessage.includes("mutual fund")
      ) {
        return `📈 **মিউচুয়াল ফান্ড** পেশাদার ব্যবস্থাপনায় বিভিন্ন কোম্পানির শেয়ারে বিনিয়োগ।

💰 **প্রত্যাশিত রিটার্ন:** ১২-১৫% (বাজার অনুযায়ী)
🎯 **ন্যূনতম বিনিয়োগ:** ৫,০০০ টাকা

**সুবিধা:**
• পেশাদার ব্যবস্থাপনা
• ঝুঁকি বিভাজন
• SIP সুবিধা
• তরলতা

⚠️ **ঝুঁকি:** মাঝারি থেকে উচ্চ

💡 **টিপ:** দীর্ঘমেয়াদী বিনিয়োগের জন্য আদর্শ।`;
      }

      if (
        lowerMessage.includes("স্টক") ||
        lowerMessage.includes("stock") ||
        lowerMessage.includes("শেয়ার")
      ) {
        return `🚀 **স্টক মার্কেট** উচ্চ রিটার্নের সম্ভাবনা, তবে ঝুঁকিও বেশি।

📊 **সম্ভাব্য রিটার্ন:** ১৫-২৫% (দীর্ঘমেয়াদে)
⚠️ **ঝুঁকি:** উচ্চ

**শুরু করার টিপস:**
১. ভালো কোম্পানি নির্বাচন
২. কম অর্থ দিয়ে শুরু
৩. দীর্ঘমেয়াদী দৃষ্টিভঙ্গি
৪. বাজার গবেষণা
৫. বিভিন্ন সেক্টরে বিনিয়োগ

💡 **টিপ:** পোর্টফোলিওর ২০-৩০% স্টকে রাখুন।`;
      }

      if (lowerMessage.includes("dps") || lowerMessage.includes("ডিপিএস")) {
        return `💳 **DPS** (Deposit Pension Scheme) দীর্ঘমেয়াদী সঞ্চয় পরিকল্পনা।

💵 **বৈশিষ্ট্য:**
• মাসিক ৫০০ টাকা থেকে শুরু
• ৫-২০ বছরের মেয়াদ
• ৭-৮% বার্ষিক সুদ
• কোন প্রাথমিক বিনিয়োগ নয়

**সুবিধা:**
• নিয়মিত সঞ্চয়ের অভ্যাস
• নিরাপদ বিনিয়োগ
• মেয়াদ শেষে বড় অংক
• ৮০% পর্যন্ত ঋণ সুবিধা

💡 **টিপ:** নিয়মিত আয়ের জন্য আদর্শ।`;
      }

      // Default Bengali response
      return `🤝 **আমি আপনাকে সাহায্য করতে পারি:**

📊 **বিনিয়োগ পরামর্শ:**
• সঞ্চয়পত্র - নিরাপদ ৮-১১% রিটার্ন
• DPS - মাসিক সঞ্চয় পরিকল্পনা
• মিউচুয়াল ফান্ড - পেশাদার ব্যবস্থাপনা
• স্টক মার্কেট - উচ্চ রিটার্ন সম্ভাবনা

💰 **আর্থিক পরিকল্পনা:**
• জরুরি তহবিল (৬ মাসের খরচ)
• ঝুঁকি মূল্যায়ন
• লক্ষ্য নির্ধারণ
• কর পরিকল্পনা

💡 **টিপ:** আপনার প্রোফাইল সম্পূর্ণ করুন যাতে আরও ব্যক্তিগতকৃত পরামর্শ পেতে পারেন!

আরও কোনো নির্দিষ্ট প্রশ্ন থাকলে জিজ্ঞাসা করুন! 😊`;
    } else {
      // English responses
      if (
        lowerMessage.includes("sanchayapatra") ||
        lowerMessage.includes("savings certificate")
      ) {
        return `🏦 **Sanchayapatra** is Bangladesh government's safest investment option.

✅ **Key Features:**
• 8.5-11% annual return
• 100% government guarantee
• Monthly/quarterly interest payment
• 5% tax on amounts up to 5 lakh

💡 **Tip:** Choose between Poribar or Pensioner Sanchayapatra based on your eligibility.`;
      }

      // Default English response
      return `🤝 **I can help you with:**

📊 **Investment Advice:**
• Sanchayapatra - Safe 8-11% returns
• DPS - Monthly savings plan
• Mutual Funds - Professional management
• Stock Market - High return potential

💰 **Financial Planning:**
• Emergency fund planning
• Risk assessment
• Goal setting
• Tax planning

💡 **Tip:** Complete your profile for more personalized advice!

Feel free to ask any specific questions! 😊`;
    }
  }

  /**
   * Get system prompt for financial advisor
   */
  static async sendMessageToAPI(
    message: string,
    conversationHistory: ChatMessage[] = [],
    user?: User,
    financialProfile?: FinancialProfile
  ): Promise<ChatResponse> {
    return this.sendMessage(
      message,
      conversationHistory,
      user,
      financialProfile
    );
  }

  /**
   * Get suggested questions based on user profile
   */
  static getSuggestedQuestions(
    user?: User,
    financialProfile?: FinancialProfile,
    language: "bn" | "en" = "bn"
  ): string[] {
    const bengaliQuestions = [
      "আমার বয়স ও আয় অনুযায়ী কোন বিনিয়োগ ভালো হবে?",
      "সঞ্চয়পত্র নাকি DPS - কোনটি বেছে নেব?",
      "শেয়ার বাজারে বিনিয়োগ করা কি নিরাপদ?",
      "জরুরি তহবিল কত রাখা উচিত?",
      "মিউচুয়াল ফান্ড সম্পর্কে জানতে চাই",
      "কম টাকায় বিনিয়োগ শুরু করার উপায়",
      "ট্যাক্স সেভিং বিনিয়োগ কোনগুলো?",
      "মুদ্রাস্ফীতির বিপরীতে কীভাবে সুরক্ষা পাব?",
    ];

    const englishQuestions = [
      "What investment is best for my age and income?",
      "Should I choose Sanchayapatra or DPS?",
      "Is it safe to invest in the stock market?",
      "How much emergency fund should I keep?",
      "Tell me about mutual funds in Bangladesh",
      "How to start investing with small amounts?",
      "What are tax-saving investment options?",
      "How to protect against inflation?",
    ];

    const questions = language === "bn" ? bengaliQuestions : englishQuestions;

    // Filter questions based on user profile
    if (user && financialProfile) {
      const filteredQuestions: string[] = [];

      // Add age-specific questions
      if (user.age < 30) {
        filteredQuestions.push(questions[0], questions[5]);
      } else if (user.age > 50) {
        filteredQuestions.push(questions[1], questions[3]);
      }

      // Add income-specific questions
      if (financialProfile.monthlyIncome > 50000) {
        filteredQuestions.push(questions[2], questions[4]);
      } else {
        filteredQuestions.push(questions[1], questions[5]);
      }

      // Add remaining questions
      questions.forEach((q) => {
        if (!filteredQuestions.includes(q) && filteredQuestions.length < 6) {
          filteredQuestions.push(q);
        }
      });

      return filteredQuestions;
    }

    return questions.slice(0, 6);
  }

  /**
   * Analyze user message for intent
   */
  static analyzeMessageIntent(message: string): {
    intent:
      | "investment_advice"
      | "product_info"
      | "calculation"
      | "general"
      | "greeting";
    confidence: number;
    entities: string[];
  } {
    const lowerMessage = message.toLowerCase();

    // Investment advice keywords
    const investmentKeywords = [
      "বিনিয়োগ",
      "investment",
      "invest",
      "portfolio",
      "পোর্টফোলিও",
      "সুপারিশ",
      "recommend",
    ];
    const productKeywords = [
      "সঞ্চয়পত্র",
      "sanchayapatra",
      "dps",
      "mutual fund",
      "stock",
      "শেয়ার",
      "bond",
    ];
    const calculationKeywords = [
      "calculate",
      "গণনা",
      "return",
      "রিটার্ন",
      "profit",
      "লাভ",
      "কত",
    ];
    const greetingKeywords = [
      "hello",
      "hi",
      "হ্যালো",
      "হাই",
      "সালাম",
      "নমস্কার",
    ];

    let intent:
      | "investment_advice"
      | "product_info"
      | "calculation"
      | "general"
      | "greeting" = "general";
    let confidence = 0;
    const entities: string[] = [];

    // Check for greetings
    if (greetingKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "greeting";
      confidence = 0.9;
    }
    // Check for investment advice
    else if (
      investmentKeywords.some((keyword) => lowerMessage.includes(keyword))
    ) {
      intent = "investment_advice";
      confidence = 0.8;
    }
    // Check for product information
    else if (
      productKeywords.some((keyword) => lowerMessage.includes(keyword))
    ) {
      intent = "product_info";
      confidence = 0.8;

      // Extract product entities
      productKeywords.forEach((keyword) => {
        if (lowerMessage.includes(keyword)) {
          entities.push(keyword);
        }
      });
    }
    // Check for calculations
    else if (
      calculationKeywords.some((keyword) => lowerMessage.includes(keyword))
    ) {
      intent = "calculation";
      confidence = 0.7;
    }

    return { intent, confidence, entities };
  }

  /**
   * Format message for better display
   */
  static formatMessage(message: string): string {
    // Just handle escaped characters, let markdown library handle the rest
    let formatted = message.replace(/\\\*/g, "*").replace(/\\\$/g, "$").trim();

    return formatted;
  }

  /**
   * Check if message is in Bengali
   */
  static isBengaliMessage(message: string): boolean {
    const bengaliCharCount = (message.match(/[\u0980-\u09FF]/g) || []).length;
    const totalCharCount = message.replace(/\s/g, "").length;
    return totalCharCount > 0 && bengaliCharCount / totalCharCount > 0.3;
  }

  /**
   * Get quick reply suggestions
   */
  static getQuickReplies(
    lastMessage: string,
    language: "bn" | "en" = "bn"
  ): string[] {
    const bengaliReplies = [
      "আরও জানতে চাই",
      "অন্য বিকল্প আছে?",
      "ঝুঁকি কেমন?",
      "কত টাকা লাগবে?",
      "ধন্যবাদ",
    ];

    const englishReplies = [
      "Tell me more",
      "Any other options?",
      "What are the risks?",
      "How much money needed?",
      "Thank you",
    ];

    return language === "bn" ? bengaliReplies : englishReplies;
  }
}
