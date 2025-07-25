# Cultural Intelligence CRM

A web-based Customer Relationship Management system that enriches traditional customer data with cultural intelligence, providing businesses with deeper insights into customer preferences, behaviors, and communication strategies without using any personal identifying information.

This project was built for the Qloo LLM Hackathon.

## The Problem: Marketing in the Dark & Guessing Games

### Problem #1: You're Segmenting by Outdated Demographics
- **95% of new consumer products fail**, often due to a failure to understand consumer needs and targeting the wrong market.
- **Most CRMs still segment by age, location, and income**—demographic models based on 1950s thinking. This tells you *who* is buying, but not *why*.
- **76% of consumers get frustrated** when they don't receive personalized interactions.

### Problem #2: Your Marketing Teams Guess at Communication Strategy
- **57% of senior marketing executives** struggle with data inconsistencies when personalizing customer experiences.
- Teams spend weeks creating personas that are often wrong.
- A/B testing takes months to reveal what cultural intelligence shows instantly.

### Problem #3: ROI from Personalization is MASSIVE When Done Right
- Companies incorporating personalization see **10-15% revenue increase**, with personalization leaders seeing **40% more revenue**.
- Proper segmentation and personalization can result in **7x higher click-through rates** and a **25% increase in conversions**.
- Personalized communication shows **6x higher performance rates** than segmented or non-specialized strategies.

## The Solution: Understand the "Why" Behind the Buy

Our Cultural Intelligence CRM platform moves beyond outdated demographics to reveal the cultural drivers behind customer behavior. An insight like **"Eco-conscious indie enthusiasts"** is far more actionable and predictive than **"25-35 year olds in NYC."** It eliminates the guesswork by providing data-driven communication playbooks for each cultural segment.

## Roadmap

### Phase 1: Core Intelligence (Implemented)
- **Multi-Modal Cultural Analysis**: Analyze customer behavior across multiple data sources simultaneously.
- **Predictive Cultural Journey Mapping**: Predict customer cultural evolution paths.
- **Hyper-Personalized Product Development**: Use cultural insights to guide product creation.

### Phase 2: Advanced Analytics (Conceptual)
- **Competitive Cultural Intelligence**: Understand competitors' cultural positioning.
- **Influence Network Analysis**: Map how cultural tastes spread across customer networks.
- **ROI Attribution Engine**: Pinpoint which cultural insights drive the most revenue.

### Phase 3: Autonomous Systems (Conceptual)
- **Self-Learning Cultural AI**: AI that improves its own cultural understanding over time without human input.
- **Conversational Cultural Intelligence**: Natural language interface for cultural insights.
- **Cultural Automation Workflows**: Automate marketing actions based on cultural triggers.

### Phase 4: Ecosystem & Future Vision (Conceptual)
- **Emotional Cultural Intelligence**: Understand the emotional aspects of cultural identity.
- **Cultural Intelligence for the Metaverse**: Understand cultural behavior in virtual spaces.
- **Cultural Intelligence API Marketplace**: Connect with external cultural data sources.


## Ethical Guardrails

- **Transparency**: This README and the application UI clearly state when and how the Qloo API and LLMs are used to generate insights.
- **Privacy-First**: The system is designed to work with anonymized data from the start, requiring no PII for its core functionality.
- **Bias Detection**: The AI segmentation flow is prompted to identify and flag segments that may be based on potentially harmful stereotypes, which are then highlighted in the UI.
- **Human-in-the-Loop**: The Cultural Accuracy Scoring feature allows users to validate AI-generated profiles, providing a feedback loop to track and improve model accuracy over time.
- **Opt-Out (Conceptual)**: While not fully implemented due to the hackathon's scope, a production version would include mechanisms for end-users to opt-out of cultural analysis, respecting user agency.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI / LLM**: Google Gemini via Genkit
- **Cultural Data API**: Qloo Taste AI™
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials & Google Provider)

## Getting Started

### 1. Environment Setup

Create a `.env` file in the root of the project and add the following environment variables.

```
# MongoDB Connection String
MONGODB_URI="your_mongodb_connection_string"

# Qloo API Credentials (from your Qloo Developer account)
QLOO_CLIENT_ID="your_qloo_client_id"
QLOO_CLIENT_SECRET="your_qloo_client_secret"

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# NextAuth.js Secret
# Run `openssl rand -base64 32` in your terminal to generate a secret
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Gemini API Key
# This is used by the Genkit Google AI plugin
GEMINI_API_KEY="your_gemini_api_key"

```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
