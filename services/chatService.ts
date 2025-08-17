import { ChatMessage, ChatResponse, User, FinancialProfile } from "@/types";

/**
 * AI Chat Service
 * Handles communication with OpenAI API for financial advice and support
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChatService {
  private static readonly API_URL =
    "https://api.openai.com/v1/chat/completions";
  private static readonly MODEL = "gpt-3.5-turbo";
  private static readonly MAX_TOKENS = 1000;

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
8. Keep responses concise but informative (max 200 words)
9. If asked about specific stocks or companies, remind users to do their own research
10. Always include disclaimers about investment risks

Available Investment Options in Bangladesh:
- Sanchayapatra (Government Savings Certificates): 8-9% annual return, very safe
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
   * Send message to OpenAI API
   */
  static async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    user?: User,
    financialProfile?: FinancialProfile
  ): Promise<ChatResponse> {
    try {
      // Prepare conversation history
      const messages: OpenAIMessage[] = [
        {
          role: "system",
          content: this.getSystemPrompt(user, financialProfile),
        },
      ];

      // Add conversation history (last 10 messages to stay within token limits)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content || msg.text || "",
        });
      });

      // Add current message
      messages.push({
        role: "user",
        content: message,
      });

      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages,
          max_tokens: this.MAX_TOKENS,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenAI API");
      }

      const assistantMessage = data.choices[0].message.content;

      return {
        success: true,
        message: assistantMessage,
        usage: data.usage,
      };
    } catch (error) {
      console.error("Chat service error:", error);

      // Return fallback response
      return {
        success: false,
        message: this.getFallbackResponse(message),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get fallback response when API is unavailable
   */
  private static getFallbackResponse(userMessage: string): string {
    const isBengali = /[\u0980-\u09FF]/.test(userMessage);

    if (isBengali) {
      return `দুঃখিত, আমি এই মুহূর্তে আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।

তবে আমি আপনাকে কিছু সাধারণ পরামর্শ দিতে পারি:
• নিয়মিত সঞ্চয় করুন (আয়ের কমপক্ষে ২০%)
• জরুরি তহবিল রাখুন (৬ মাসের খরচের সমান)
• বিভিন্ন ধরনের বিনিয়োগে অর্থ ভাগ করুন
• সঞ্চয়পত্র ও DPS নিরাপদ বিকল্প
• বিনিয়োগের আগে ভালো করে জেনে নিন

💡 মনে রাখবেন: ধৈর্য ও নিয়মিততাই সফল বিনিয়োগের চাবিকাঠি!`;
    } else {
      return `I apologize, but I'm currently unable to process your question. Please try again later.

However, here are some general financial tips for Bangladesh:
• Save regularly (at least 20% of income)
• Maintain emergency fund (6 months expenses)
• Diversify your investments
• Consider Sanchayapatra and DPS for safe returns
• Research before investing in stocks or mutual funds

💡 Remember: Patience and consistency are key to successful investing!`;
    }
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
    // Add line breaks for better readability
    let formatted = message
      .replace(/\n\n/g, "\n")
      .replace(/([।!?])\s*([A-Za-z\u0980-\u09FF])/g, "$1\n\n$2")
      .replace(/(\d+\.)\s*([A-Za-z\u0980-\u09FF])/g, "$1 $2")
      .trim();

    return formatted;
  }

  /**
   * Check if message is in Bengali
   */
  static isBengaliMessage(message: string): boolean {
    const bengaliCharCount = (message.match(/[\u0980-\u09FF]/g) || []).length;
    const totalCharCount = message.replace(/\s/g, "").length;
    return bengaliCharCount / totalCharCount > 0.3;
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
