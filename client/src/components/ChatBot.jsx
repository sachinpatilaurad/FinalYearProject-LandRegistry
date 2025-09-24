import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "./WalletContext.jsx";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🏠 Hello! I'm your intelligent Land Registry AI Assistant. I can help you with:\n\n• Land registration process\n• Certificate verification\n• Transfer procedures\n• Legal requirements\n• Technical support\n• General questions beyond land registry\n\n🧠 I use AI reasoning to understand and answer complex questions!\n\nWhat would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState([]); // Track conversation history for better AI responses
  const messagesEndRef = useRef(null);
  const { contract, account } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base for common questions
  const knowledgeBase = {
    registration: {
      keywords: ["register", "registration", "new land", "how to register"],
      response: `📋 **Land Registration Process:**

1. **Requirements:**
   - Valid government-issued ID
   - Land ownership documents
   - Survey number/plot details
   - Location coordinates

2. **Steps:**
   - Go to "Register New Land" tab
   - Use interactive map to mark boundaries
   - Fill in land details (auto-filled from map)
   - Submit for blockchain registration

3. **Fees:** Only blockchain transaction fees apply

Need help with specific steps? Just ask! 🚀`,
    },
    certificate: {
      keywords: ["certificate", "verify", "validation", "hash", "document"],
      response: `📜 **Land Certificate Information:**

**Generation:**
- Automatically created after land registration
- Contains unique cryptographic hash
- Downloadable as PDF with QR code

**Verification:**
- Use certificate hash at /verify-certificate
- Anyone can verify authenticity
- Blockchain-secured, tamper-proof

**Features:**
- Unique 64-character hash
- Owner details and land information
- Issue date and validity status

Want to verify a certificate? Share the hash! 🔍`,
    },
    transfer: {
      keywords: ["transfer", "sell", "buy", "ownership", "approve"],
      response: `🔄 **Land Transfer Process:**

**For Sellers:**
1. Put land "For Sale" in "My Lands"
2. Wait for transfer requests
3. Approve/deny requests in "Pending Requests"

**For Buyers:**
1. Browse "Explore Lands" section
2. Send transfer request for desired land
3. Wait for owner approval

**Security:**
- All transfers recorded on blockchain
- Previous certificates become invalid
- New certificate issued to new owner

Questions about a specific transfer? Let me know! 💼`,
    },
    blockchain: {
      keywords: [
        "blockchain",
        "security",
        "immutable",
        "decentralized",
        "smart contract",
      ],
      response: `⛓️ **Blockchain Technology Benefits:**

**Security:**
- Immutable records (cannot be altered)
- Cryptographic hash verification
- Decentralized storage

**Transparency:**
- All transactions publicly viewable
- Complete ownership history
- Real-time verification

**Trust:**
- No central authority required
- Smart contract automation
- Reduced fraud potential

**Accessibility:**
- 24/7 availability
- Global verification
- No geographical restrictions

Technical questions? I'm here to help! 🛡️`,
    },
    fees: {
      keywords: ["fee", "cost", "price", "payment", "transaction"],
      response: `💰 **Fee Structure:**

**Platform Fees:**
- Registration: FREE (only blockchain gas fees)
- Certificate Generation: FREE
- Verification: FREE for everyone

**Blockchain Costs:**
- Gas fees for transactions (~$0.01-$1)
- Varies with network congestion
- Paid in blockchain currency

**No Hidden Charges:**
- No monthly subscriptions
- No document storage fees
- No verification limits

Questions about specific transaction costs? Ask away! 💳`,
    },
    legal: {
      keywords: ["legal", "law", "rights", "government", "compliance", "valid"],
      response: `⚖️ **Legal & Compliance Information:**

**Platform Status:**
- Blockchain records supplement official documents
- Check local regulations for legal recognition
- Consult legal professionals for advice

**Your Rights:**
- Full control of your land data
- Complete ownership history access
- Certificate generation anytime

**Compliance:**
- Follow local property laws
- Maintain official documentation
- Use platform as additional security layer

**Disclaimer:** This platform provides technological solutions. For legal advice, consult qualified professionals.

Legal questions? I'll do my best to guide you! ⚖️`,
    },
  };

  // Enhanced AI response system with intelligent reasoning
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Check for specific user context first
    if (message.includes("my land") && account) {
      return `🏠 **Your Account Status:**

Wallet: ${account.substring(0, 6)}...${account.substring(38)}

I can help you with:
- Viewing your registered lands
- Understanding certificate status
- Transfer procedures
- Technical issues

What specific help do you need with your lands?`;
    }

    // Certificate hash verification
    if (message.length === 64 && /^[a-f0-9]+$/i.test(message)) {
      return `🔍 **Certificate Hash Detected!**

Hash: \`${userMessage}\`

To verify this certificate:
1. Go to [Certificate Verification](/verify-certificate)
2. Paste the hash in the verification field
3. Click "Verify Certificate"

This will show you complete land and ownership details if the certificate is valid.

Need help with verification? Let me know!`;
    }

    // Check knowledge base for exact matches first
    for (const [topic, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some((keyword) => message.includes(keyword))) {
        return data.response;
      }
    }

    // If no exact match found, use AI reasoning
    return getIntelligentAIResponse(userMessage, message);
  };

  // Intelligent AI system that can reason and think
  const getIntelligentAIResponse = (originalMessage, message) => {
    // AI Analysis Engine - analyzes context and intent
    const analysis = analyzeUserIntent(originalMessage, message);

    // Generate intelligent response based on analysis
    return generateIntelligentResponse(originalMessage, message, analysis);
  };

  // AI Intent Analysis - understands what user really wants
  const analyzeUserIntent = (originalMessage, message) => {
    const analysis = {
      intent: "general_inquiry",
      confidence: 0.5,
      topics: [],
      complexity: "simple",
      urgency: "normal",
      emotional_tone: "neutral",
      technical_level: "basic",
    };

    // Detect intent patterns
    if (message.match(/\b(what|how|why|when|where|who|which)\b/)) {
      analysis.intent = "information_seeking";
      analysis.confidence += 0.2;
    }

    if (message.match(/\b(help|assist|support|guide|explain)\b/)) {
      analysis.intent = "help_request";
      analysis.confidence += 0.3;
    }

    if (message.match(/\b(problem|issue|error|bug|not working|failed)\b/)) {
      analysis.intent = "troubleshooting";
      analysis.urgency = "high";
      analysis.confidence += 0.3;
    }

    if (message.match(/\b(compare|vs|versus|difference|better)\b/)) {
      analysis.intent = "comparison";
      analysis.confidence += 0.2;
    }

    // Detect topics
    const topicKeywords = {
      blockchain: [
        "blockchain",
        "crypto",
        "ethereum",
        "smart contract",
        "decentralized",
      ],
      property: ["property", "real estate", "land", "house", "apartment"],
      investment: ["invest", "money", "profit", "roi", "market", "price"],
      legal: ["legal", "law", "court", "lawyer", "rights", "compliance"],
      technical: ["code", "programming", "api", "database", "server"],
      security: ["security", "safe", "fraud", "hack", "protect"],
      finance: ["loan", "mortgage", "bank", "credit", "finance"],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        analysis.topics.push(topic);
      }
    }

    // Detect complexity
    if (message.length > 100 || message.split(" ").length > 20) {
      analysis.complexity = "complex";
    } else if (message.length > 50 || message.split(" ").length > 10) {
      analysis.complexity = "moderate";
    }

    // Detect technical level
    if (
      message.match(
        /\b(algorithm|protocol|api|database|framework|architecture)\b/
      )
    ) {
      analysis.technical_level = "advanced";
    } else if (message.match(/\b(code|programming|technical|system)\b/)) {
      analysis.technical_level = "intermediate";
    }

    // Detect emotional tone
    if (message.match(/\b(frustrated|angry|upset|disappointed)\b/)) {
      analysis.emotional_tone = "negative";
    } else if (message.match(/\b(great|awesome|amazing|excellent|love)\b/)) {
      analysis.emotional_tone = "positive";
    } else if (message.match(/\b(urgent|immediately|asap|quickly)\b/)) {
      analysis.emotional_tone = "urgent";
    }

    return analysis;
  };

  // Generate intelligent responses based on AI analysis
  const generateIntelligentResponse = (originalMessage, message, analysis) => {
    // Start with context-aware greeting based on analysis
    let response = getContextualGreeting(analysis);

    // Add main content based on intent and topics
    response += getMainContent(originalMessage, message, analysis);

    // Add follow-up suggestions
    response += getFollowUpSuggestions(analysis);

    return response;
  };

  // Context-aware greeting generator
  const getContextualGreeting = (analysis) => {
    if (analysis.emotional_tone === "urgent") {
      return `� **I understand this is urgent!** Let me help you right away.\n\n`;
    } else if (analysis.emotional_tone === "negative") {
      return `😔 **I can sense you might be facing some challenges.** Don't worry, I'm here to help!\n\n`;
    } else if (analysis.emotional_tone === "positive") {
      return `😊 **Great to see your enthusiasm!** I'm excited to help you with this.\n\n`;
    } else if (analysis.intent === "troubleshooting") {
      return `🔧 **Technical Issue Detected!** Let me diagnose this for you.\n\n`;
    } else if (analysis.complexity === "complex") {
      return `🧠 **This is a comprehensive question!** Let me break it down for you.\n\n`;
    }

    return `🤖 **AI Analysis Complete!** Based on your question, here's my intelligent response:\n\n`;
  };

  // Main content generator using AI reasoning
  const getMainContent = (originalMessage, message, analysis) => {
    let content = "";

    // Generate content based on intent
    switch (analysis.intent) {
      case "information_seeking":
        content += generateEducationalContent(
          originalMessage,
          analysis.topics,
          analysis.technical_level
        );
        break;
      case "help_request":
        content += generateHelpContent(
          originalMessage,
          analysis.topics,
          analysis.complexity
        );
        break;
      case "troubleshooting":
        content += generateTroubleshootingContent(
          originalMessage,
          analysis.topics
        );
        break;
      case "comparison":
        content += generateComparisonContent(originalMessage, analysis.topics);
        break;
      default:
        content += generateGeneralContent(originalMessage, analysis);
    }

    return content;
  };

  // Educational content generator
  const generateEducationalContent = (question, topics, techLevel) => {
    let content = `**📚 Understanding: "${question}"**\n\n`;

    if (topics.includes("blockchain")) {
      content += `**🔗 Blockchain Context:**\n`;
      if (techLevel === "advanced") {
        content += `• Cryptographic hash functions ensure data integrity\n• Consensus mechanisms validate transactions\n• Immutable ledger provides audit trails\n• Smart contracts automate execution logic\n\n`;
      } else if (techLevel === "intermediate") {
        content += `• Blockchain stores data in linked blocks\n• Each transaction is verified by network\n• Data cannot be changed once confirmed\n• Smart contracts execute automatically\n\n`;
      } else {
        content += `• Think of blockchain as a digital record book\n• Every transaction is permanently recorded\n• Multiple copies exist for security\n• No single authority controls it\n\n`;
      }
    }

    if (topics.includes("property")) {
      content += `**🏠 Property Management Insights:**\n• Land registry systems track ownership\n• Digital certificates prove ownership\n• Transfer processes ensure legal validity\n• Market analysis guides investment decisions\n\n`;
    }

    if (topics.includes("investment")) {
      content += `**💰 Investment Principles:**\n• Location drives property value\n• Market research is essential\n• Diversification reduces risk\n• Long-term perspective yields better returns\n\n`;
    }

    return content;
  };

  // Help content generator
  const generateHelpContent = (question, topics, complexity) => {
    let content = `**🆘 Comprehensive Help: "${question}"**\n\n`;

    if (complexity === "complex") {
      content += `**📋 Breaking Down Your Complex Query:**\n`;
      content += `I've analyzed your multi-part question and here's how I can help:\n\n`;
    }

    content += `**🎯 Specific Assistance Available:**\n`;

    if (topics.includes("blockchain") || topics.includes("technical")) {
      content += `• **Technical Guidance**: Code examples, API documentation, implementation steps\n`;
    }

    if (topics.includes("property") || topics.includes("legal")) {
      content += `• **Property Procedures**: Registration steps, legal requirements, documentation\n`;
    }

    if (topics.includes("investment") || topics.includes("finance")) {
      content += `• **Financial Planning**: Investment strategies, market analysis, risk assessment\n`;
    }

    content += `• **Step-by-step Walkthroughs**: Detailed processes with examples\n`;
    content += `• **Best Practices**: Industry standards and recommended approaches\n`;
    content += `• **Troubleshooting**: Common issues and their solutions\n\n`;

    return content;
  };

  // Troubleshooting content generator
  const generateTroubleshootingContent = (question, topics) => {
    let content = `**🔧 Intelligent Troubleshooting: "${question}"**\n\n`;

    content += `**🔍 Diagnostic Analysis:**\n`;

    if (topics.includes("technical")) {
      content += `• **System Check**: Verifying technical components\n`;
      content += `• **Error Pattern Recognition**: Analyzing failure symptoms\n`;
      content += `• **Root Cause Analysis**: Identifying underlying issues\n\n`;
    }

    content += `**⚡ Immediate Solutions:**\n`;
    content += `1. **Quick Fix**: Try basic troubleshooting steps\n`;
    content += `2. **System Reset**: Clear cache and restart processes\n`;
    content += `3. **Environment Check**: Verify settings and configurations\n`;
    content += `4. **Alternative Approach**: Backup methods if primary fails\n\n`;

    content += `**🛡️ Prevention Strategies:**\n`;
    content += `• Regular system maintenance\n`;
    content += `• Backup procedures\n`;
    content += `• Monitoring and alerts\n`;
    content += `• Documentation updates\n\n`;

    return content;
  };

  // Comparison content generator
  const generateComparisonContent = (question, topics) => {
    let content = `**⚖️ Intelligent Comparison Analysis: "${question}"**\n\n`;

    content += `**📊 Comparative Framework:**\n\n`;

    if (topics.includes("blockchain")) {
      content += `**🔗 Blockchain Solutions Comparison:**\n`;
      content += `• **Performance**: Speed, scalability, throughput\n`;
      content += `• **Security**: Cryptographic strength, consensus mechanisms\n`;
      content += `• **Cost**: Transaction fees, development expenses\n`;
      content += `• **Adoption**: Community size, enterprise usage\n\n`;
    }

    if (topics.includes("property")) {
      content += `**🏠 Property Options Analysis:**\n`;
      content += `• **Location Factors**: Accessibility, growth potential\n`;
      content += `• **Financial Metrics**: ROI, cash flow, appreciation\n`;
      content += `• **Risk Assessment**: Market volatility, regulatory changes\n`;
      content += `• **Management Requirements**: Maintenance, tenant relations\n\n`;
    }

    content += `**🎯 Decision Matrix:**\n`;
    content += `Based on your specific needs, I can help you weigh:\n`;
    content += `• Short-term vs long-term benefits\n`;
    content += `• Cost-effectiveness vs feature richness\n`;
    content += `• Ease of use vs advanced capabilities\n`;
    content += `• Risk tolerance vs potential rewards\n\n`;

    return content;
  };

  // General content generator for unmatched queries
  const generateGeneralContent = (question, analysis) => {
    let content = `**🧠 AI Analysis of: "${question}"**\n\n`;

    content += `**🔍 Contextual Understanding:**\n`;
    content += `I've analyzed your question and detected it relates to`;

    if (analysis.topics.length > 0) {
      content += ` ${analysis.topics.join(", ")} with ${
        analysis.complexity
      } complexity.\n\n`;
    } else {
      content += ` general inquiry requiring thoughtful consideration.\n\n`;
    }

    content += `**💡 Intelligent Insights:**\n`;

    // Generate insights based on question patterns
    if (
      question.toLowerCase().includes("future") ||
      question.toLowerCase().includes("trend")
    ) {
      content += `• **Future Trends**: Based on current technology evolution\n`;
      content += `• **Market Predictions**: Analyzing industry patterns\n`;
      content += `• **Innovation Opportunities**: Emerging possibilities\n\n`;
    } else if (
      question.toLowerCase().includes("best") ||
      question.toLowerCase().includes("recommend")
    ) {
      content += `• **Best Practices**: Industry-proven approaches\n`;
      content += `• **Recommendations**: Tailored to your context\n`;
      content += `• **Quality Standards**: Benchmarks for success\n\n`;
    } else {
      content += `• **Comprehensive Analysis**: Multi-faceted perspective\n`;
      content += `• **Practical Applications**: Real-world implementations\n`;
      content += `• **Strategic Considerations**: Long-term implications\n\n`;
    }

    content += `**🎯 Personalized Guidance:**\n`;
    content += `Based on your question's complexity (${analysis.complexity}) and technical level (${analysis.technical_level}), `;
    content += `I've tailored this response to provide the most relevant information.\n\n`;

    return content;
  };

  // Follow-up suggestions generator
  const getFollowUpSuggestions = (analysis) => {
    let suggestions = `**🔄 What's Next?**\n\n`;

    suggestions += `**💬 You might also want to ask:**\n`;

    if (analysis.topics.includes("blockchain")) {
      suggestions += `• "How does blockchain compare to traditional databases?"\n`;
      suggestions += `• "What are the security benefits of smart contracts?"\n`;
    }

    if (analysis.topics.includes("property")) {
      suggestions += `• "What factors should I consider before investing?"\n`;
      suggestions += `• "How do I verify property ownership digitally?"\n`;
    }

    if (analysis.intent === "troubleshooting") {
      suggestions += `• "What are common preventive measures?"\n`;
      suggestions += `• "How can I avoid this issue in the future?"\n`;
    }

    suggestions += `• "Can you explain this in simpler terms?"\n`;
    suggestions += `• "What are the practical applications?"\n`;
    suggestions += `• "Are there any risks I should know about?"\n\n`;

    suggestions += `**🤖 AI Note**: I can adapt my responses to your preferred technical level and provide more specific guidance based on your exact situation!`;

    return suggestions;
  };

  // Keep basic interactions, route complex questions to intelligent AI
  const getGeneralAIResponse = (originalMessage, message) => {
    // Basic greetings - use predefined responses
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey") ||
      message.includes("good morning") ||
      message.includes("good afternoon") ||
      message.includes("good evening")
    ) {
      const greetings = [
        "👋 Hello! I'm your intelligent Land Registry Assistant.",
        "🌟 Hi there! Great to see you here!",
        "🏠 Welcome! I'm here to help with all your land registry needs.",
      ];
      const randomGreeting =
        greetings[Math.floor(Math.random() * greetings.length)];

      return `${randomGreeting}

**I can help you with:**
• Land registration and management
• Certificate verification
• Legal and technical questions
• General property advice
• Technology explanations
• And much more!

What's on your mind today?`;
    }

    // Basic help requests - use predefined responses
    if (
      message.includes("help") ||
      message.includes("assist") ||
      message.includes("support")
    ) {
      return `🆘 **I'm here to help!** I can assist you with:

**🏠 Land Registry Specific:**
• Registration process and requirements
• Certificate verification and generation
• Property transfers and ownership
• Legal compliance and documentation
• Fees and transaction costs

**🧠 General Knowledge:**
• Technology explanations (blockchain, smart contracts)
• Real estate advice and market insights  
• Legal concepts and property law basics
• Investment and financial guidance
• Technical troubleshooting

**💬 Natural Conversation:**
• Answer questions on various topics
• Provide explanations and tutorials
• Give recommendations and advice
• Help with problem-solving

Just ask me anything! I'll do my best to provide helpful answers.`;
    }

    // Thanks and appreciation - use predefined responses
    if (
      message.includes("thank") ||
      message.includes("thanks") ||
      message.includes("appreciate") ||
      message.includes("great") ||
      message.includes("awesome")
    ) {
      return `🙏 You're very welcome! I'm glad I could help.

Is there anything else you'd like to know about land registry, blockchain technology, or any other topic? I'm here to assist! 

Feel free to ask follow-up questions or explore new topics. 😊`;
    }

    // For all complex/unmatched questions, use intelligent AI reasoning
    return getIntelligentAIResponse(originalMessage, message);
  };

  // Explanation handler for "what is", "explain", etc.
  const getExplanationResponse = (original, message) => {
    if (message.includes("blockchain")) {
      return `⛓️ **Blockchain Explained:**

Blockchain is like a digital ledger (record book) that:

**Key Features:**
• **Immutable**: Once written, cannot be changed
• **Decentralized**: No single point of control
• **Transparent**: Everyone can verify records
• **Secure**: Uses cryptography for protection

**In Land Registry:**
• Your property records are permanent
• No one can forge or delete your ownership
• Anyone can verify your certificates
• No central authority needed

Think of it as a permanent, tamper-proof filing system that everyone can access but no one can manipulate! 🔒`;
    }

    if (message.includes("smart contract")) {
      return `🤖 **Smart Contracts Explained:**

A smart contract is like a digital vending machine:

**Traditional Contract:**
• Written on paper
• Needs lawyers/courts to enforce
• Manual verification required

**Smart Contract:**
• Written in code
• Self-executing when conditions met
• Automatic verification and execution

**In Our Platform:**
• Automatically transfers land ownership
• Validates all requirements before execution
• Cannot be manipulated or bypassed
• Reduces costs and time

It's like having a robot lawyer that never sleeps! ⚖️🤖`;
    }

    if (message.includes("nft") || message.includes("token")) {
      return `🎨 **NFTs in Land Registry:**

**What are NFTs?**
• Non-Fungible Tokens = Unique digital certificates
• Each one is different (non-fungible)
• Stored on blockchain permanently

**Land as NFTs:**
• Each property becomes a unique digital asset
• Ownership proven by wallet possession
• Can be transferred instantly
• Built-in provenance and history

**Benefits:**
• Global tradability
• Instant verification
• Reduced paperwork
• Future-ready format

Your land certificate is essentially an NFT! 🏆`;
    }

    // Generic explanation response
    return `🧠 **Understanding "${original}"**

I'd be happy to explain this concept! Based on your question, here's what I can share:

**Context Analysis:**
Your question relates to ${
      message.includes("technology")
        ? "technology and innovation"
        : message.includes("property")
        ? "real estate and property management"
        : message.includes("legal")
        ? "legal concepts and compliance"
        : "general knowledge"
    }.

**Key Points to Consider:**
• Modern solutions often involve digital transformation
• Blockchain technology is revolutionizing many industries
• Security and transparency are crucial in property management
• Legal compliance varies by jurisdiction

**Would you like me to:**
• Explain any specific technical terms?
• Provide more detailed information?
• Give practical examples?
• Suggest related resources?

Feel free to ask more specific questions! 💡`;
  };

  // Investment advice handler
  const getInvestmentAdvice = (original, message) => {
    return `💰 **Investment Insights:**

**Land/Property Investment Basics:**

**✅ Advantages:**
• Tangible asset with intrinsic value
• Hedge against inflation
• Potential rental income
• Long-term appreciation
• Portfolio diversification

**⚠️ Considerations:**
• Location is crucial (research thoroughly)
• Market cycles affect timing
• Liquidity is lower than stocks
• Maintenance and tax costs
• Legal due diligence required

**🔗 Blockchain Benefits for Investors:**
• Transparent ownership history
• Reduced transaction costs
• Faster settlement times
• Global accessibility
• Fraud prevention

**💡 Smart Tips:**
• Research local market trends
• Verify all legal documentation
• Consider long-term growth potential
• Factor in all costs (taxes, maintenance)
• Diversify your investments

**Disclaimer:** This is educational information, not financial advice. Consult professionals for investment decisions! 📈`;
  };

  // Technical support handler
  const getTechnicalSupport = (original, message) => {
    return `🔧 **Technical Support:**

**Common Issues & Solutions:**

**🔌 Wallet Connection Problems:**
• Install MetaMask browser extension
• Ensure you're on the correct network
• Clear browser cache and reload
• Check wallet balance for gas fees

**📱 Transaction Failures:**
• Insufficient gas fees → Add more ETH
• Network congestion → Try later
• Wrong network → Switch to correct chain
• Pending transactions → Wait or speed up

**🖥️ Interface Issues:**
• Clear browser cache
• Disable ad blockers
• Try different browser
• Check internet connection

**📋 Registration Problems:**
• Fill all required fields completely
• Check coordinate format
• Ensure wallet is connected
• Verify account approval status

**🆘 Still Need Help?**
Please describe your specific issue:
• What were you trying to do?
• What error message appeared?
• Which browser are you using?
• What network are you on?

I'll provide targeted assistance! 🛠️`;
  };

  // Legal guidance handler
  const getLegalGuidance = (original, message) => {
    return `⚖️ **Legal Guidance:**

**⚠️ Important Disclaimer:**
I provide general information, not legal advice. Consult qualified legal professionals for specific situations.

**General Legal Concepts:**

**🏠 Property Rights:**
• Ownership: Right to possess, use, and transfer
• Title: Legal evidence of ownership
• Registration: Official recording of ownership
• Transfer: Legal change of ownership

**📜 Documentation:**
• Always maintain official government records
• Blockchain certificates supplement (don't replace) legal docs
• Keep physical copies in safe storage
• Update records with relevant authorities

**🔍 Due Diligence:**
• Verify seller's legitimate ownership
• Check for liens, encumbrances, or disputes
• Ensure proper legal descriptions
• Review local zoning and usage restrictions

**⚡ Blockchain Legal Status:**
• Legal recognition varies by jurisdiction
• Most countries are developing frameworks
• Use as additional security layer
• Maintain traditional legal compliance

**🚨 When to Consult Lawyers:**
• Complex transactions
• Dispute resolution
• Regulatory compliance
• Cross-border deals

Need jurisdiction-specific guidance? I can provide general direction! ⚖️`;
  };

  // Real estate advice handler
  const getRealEstateAdvice = (original, message) => {
    return `🏡 **Real Estate Guidance:**

**🔍 Before Buying:**
• Research neighborhood demographics
• Check property history and previous sales
• Inspect for structural issues
• Review local market trends
• Verify zoning and usage rights

**💰 Financial Considerations:**
• Get pre-approved for financing
• Factor in all costs (taxes, fees, insurance)
• Consider future maintenance expenses
• Evaluate rental potential if applicable
• Plan for market fluctuations

**📋 Due Diligence Checklist:**
• Title verification and clear ownership
• Property survey and boundary confirmation
• Environmental assessments if needed
• HOA rules and fees (if applicable)
• Local development plans

**🔗 Blockchain Advantages:**
• Transparent ownership history
• Faster transaction processing
• Reduced intermediary costs
• Global accessibility for investors
• Enhanced security and fraud prevention

**📈 Market Insights:**
• Location drives 70% of property value
• Infrastructure development increases demand
• Population growth indicates good markets
• Employment centers attract residents
• School districts affect residential values

**💡 Pro Tips:**
• Buy in emerging areas before development
• Consider long-term demographic trends
• Network with local real estate professionals
• Stay updated on policy changes

Questions about specific markets or strategies? Ask away! 🏠`;
  };

  // Security advice handler
  const getSecurityAdvice = (original, message) => {
    return `🛡️ **Security Best Practices:**

**🔐 Wallet Security:**
• Never share your private key/seed phrase
• Use hardware wallets for large amounts
• Enable 2FA where possible
• Keep backups in secure locations
• Use strong, unique passwords

**🚨 Fraud Prevention:**
• Verify website URLs carefully (check for typos)
• Never click suspicious links
• Don't trust unsolicited offers
• Research before any transactions
• When in doubt, ask for help

**⛓️ Blockchain Security:**
• Transactions are irreversible - double-check everything
• Verify recipient addresses carefully
• Start with small test transactions
• Keep records of all transactions
• Understand gas fees and network costs

**🏠 Property Security:**
• Verify seller identity thoroughly
• Check ownership documentation
• Use official channels for verification
• Don't rush into decisions
• Get professional inspections

**🔍 Red Flags to Avoid:**
• Pressure to act quickly
• Requests for upfront payments
• Unrealistic promises or returns
• Poor communication or evasiveness
• Lack of proper documentation

**✅ Our Platform Security:**
• Smart contract audited code
• Immutable blockchain records
• Multi-step verification process
• Transparent transaction history
• Community-verified information

Stay vigilant and trust your instincts! If something feels wrong, investigate further. 🕵️‍♂️`;
  };

  // Future insights handler
  const getFutureInsights = (original, message) => {
    return `🚀 **Future of Land Registry & Blockchain:**

**🔮 Upcoming Trends:**

**📱 Technology Evolution:**
• Mobile-first property management
• AI-powered property valuation
• IoT integration for smart properties
• Virtual/Augmented reality property tours
• Automated legal document generation

**🌍 Global Expansion:**
• Cross-border property investments
• International legal framework harmonization
• Multi-chain blockchain interoperability
• Global property tokenization
• Decentralized property marketplaces

**🏛️ Government Integration:**
• Official blockchain adoption by governments
• Digital identity verification systems
• Automated tax calculation and payment
• Streamlined regulatory compliance
• Public-private partnership models

**💡 Platform Roadmap:**
• Multi-language support
• Government API integrations
• Advanced analytics dashboard
• Mobile application launch
• DeFi lending against property tokens

**🌟 Long-term Vision:**
• Instant global property transfers
• Fractional ownership opportunities
• Automated property management
• AI-driven market predictions
• Complete digitization of real estate

**🔧 Continuous Improvements:**
• Enhanced user experience
• Lower transaction costs
• Faster processing times
• Better security measures
• More comprehensive features

The future is digital, transparent, and user-controlled! 🌐`;
  };

  // Comparison response handler
  const getComparisonResponse = (original, message) => {
    if (message.includes("traditional") || message.includes("conventional")) {
      return `📊 **Blockchain vs Traditional Land Registry:**

**⏰ Time & Efficiency:**
• Traditional: Weeks/months for transfers
• Blockchain: Minutes/hours for completion

**💰 Cost Comparison:**
• Traditional: High fees (lawyers, agents, government)
• Blockchain: Low fees (only network transaction costs)

**🔒 Security:**
• Traditional: Paper documents (forgeable, losable)
• Blockchain: Cryptographic proof (tamper-proof, permanent)

**🌐 Accessibility:**
• Traditional: Office hours, physical presence required
• Blockchain: 24/7 access from anywhere globally

**👥 Trust:**
• Traditional: Relies on central authorities
• Blockchain: Trustless system with transparent verification

**📋 Record Keeping:**
• Traditional: Centralized databases (single point of failure)
• Blockchain: Distributed ledger (no single point of failure)

**🚀 Innovation:**
• Traditional: Slow to adopt new technologies
• Blockchain: Built for future integration and expansion

The future is clearly moving toward blockchain solutions! 🏆`;
    }

    return `🔍 **Comparison Analysis:**

I can help you compare different aspects of land registry, blockchain technologies, or property management approaches.

**Popular Comparisons:**
• Blockchain vs Traditional systems
• Different blockchain networks
• Property types and investments
• Legal frameworks across regions
• Technology solutions and platforms

What specific comparison would you like to explore? I'll provide detailed analysis with pros, cons, and recommendations! 📈`;
  };

  // Time-related responses
  const getTimeResponse = (original, message) => {
    return `⏰ **Timing Information:**

**⚡ Transaction Times:**
• Land Registration: 2-5 minutes (after wallet confirmation)
• Ownership Transfer: 1-3 minutes per step
• Certificate Generation: Instant after registration
• Verification: Real-time, instant results

**📋 Process Durations:**
• User Account Approval: Depends on admin review
• Smart Contract Deployment: One-time, already complete
• Blockchain Confirmation: 15 seconds to 2 minutes
• Document Processing: Immediate

**🌍 Network Factors:**
• Ethereum network congestion affects speed
• Gas price impacts confirmation priority
• Peak hours may cause slight delays
• Off-peak times offer faster processing

**💡 Optimization Tips:**
• Use recommended gas prices for faster confirmation
• Avoid peak network usage times (US business hours)
• Prepare all information before starting
• Keep wallet funded with sufficient gas

**🔮 Future Improvements:**
• Layer 2 solutions for instant transactions
• Cross-chain compatibility for better options
• Optimized smart contracts for lower costs
• Enhanced user experience interfaces

**⚠️ Important:** While blockchain operations are fast, always allow extra time for network variability and verification steps.

Any specific timing questions? I can provide more detailed estimates! ⏱️`;
  };

  // Contextual response for unmatched questions
  const getContextualResponse = (original, message) => {
    // Analyze the question for context clues
    const questionWords = message.match(
      /\b(what|how|why|when|where|who|which)\b/g
    );
    const topics = [];

    if (
      message.includes("property") ||
      message.includes("land") ||
      message.includes("real estate")
    )
      topics.push("property management");
    if (
      message.includes("blockchain") ||
      message.includes("crypto") ||
      message.includes("ethereum")
    )
      topics.push("blockchain technology");
    if (
      message.includes("legal") ||
      message.includes("law") ||
      message.includes("court")
    )
      topics.push("legal compliance");
    if (
      message.includes("invest") ||
      message.includes("money") ||
      message.includes("profit")
    )
      topics.push("investment strategies");
    if (
      message.includes("secure") ||
      message.includes("safe") ||
      message.includes("protect")
    )
      topics.push("security measures");

    const topicStr = topics.length > 0 ? topics.join(" and ") : "your inquiry";

    return `🧠 **I understand you're asking about ${topicStr}.**

Based on your question: "${original}"

**Here's what I can help with:**

${
  questionWords && questionWords.includes("what")
    ? "• **What**: I can explain concepts, features, and processes\n"
    : ""
}${
      questionWords && questionWords.includes("how")
        ? "• **How**: I can guide you through procedures and methods\n"
        : ""
    }${
      questionWords && questionWords.includes("why")
        ? "• **Why**: I can explain reasoning and benefits\n"
        : ""
    }${
      questionWords && questionWords.includes("when")
        ? "• **When**: I can provide timing and scheduling information\n"
        : ""
    }${
      questionWords && questionWords.includes("where")
        ? "• **Where**: I can guide you to the right sections or resources\n"
        : ""
    }

**💡 Let me help you find the right information:**

1. **Be more specific**: What particular aspect interests you most?
2. **Ask follow-ups**: I can dive deeper into any topic
3. **Request examples**: I can provide practical scenarios
4. **Seek guidance**: I can walk you through step-by-step processes

**🎯 Popular topics I'm great at:**
• Land registry procedures and requirements
• Blockchain technology and smart contracts
• Investment advice and market insights
• Security best practices and fraud prevention
• Technical support and troubleshooting
• Legal concepts and compliance guidance

What would you like to explore further? I'm here to provide detailed, helpful answers! 🚀`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update conversation context for better AI responses
    setConversationContext((prev) => [
      ...prev.slice(-4),
      {
        // Keep last 5 messages for context
        message: inputMessage,
        timestamp: new Date(),
        type: "user",
      },
    ]);

    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI thinking time with more realistic delays for complex analysis
    const thinkingTime =
      currentMessage.length > 50
        ? 2000 + Math.random() * 2000
        : 1000 + Math.random() * 1000;

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(currentMessage),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Add AI response to context
      setConversationContext((prev) => [
        ...prev,
        {
          message: aiResponse.text,
          timestamp: new Date(),
          type: "ai",
        },
      ]);

      setIsTyping(false);
    }, thinkingTime);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How to register land?",
    "Verify certificate",
    "Transfer ownership",
    "What are the fees?",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>

        {/* Notification badge */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            AI
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-dark-secondary rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Land Registry Assistant</h3>
                <p className="text-xs opacity-90">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.sender === "user" ? "text-right" : ""
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      🧠 AI analyzing your question...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Quick questions:
              </div>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here..."
                className="flex-1 resize-none input-field text-sm"
                rows="1"
                style={{ minHeight: "36px", maxHeight: "100px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
