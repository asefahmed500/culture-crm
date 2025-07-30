g
# Cultural Intelligence CRM

A web-based Customer Relationship Management system that enriches traditional customer data with cultural intelligence, providing businesses with deeper insights into customer preferences, behaviors, and communication strategies without using any personal identifying information.

This project was built for the Qloo LLM Hackathon.

## The Problem: Marketing in the Dark & Guessing Games

An insight like **"Eco-conscious indie enthusiasts"** is far more actionable and predictive than **"25-35 year olds in NYC."** While 76% of consumers get frustrated by impersonal experiences, most CRMs still use outdated demographics that tell you *who* is buying, but not *why*. Our platform moves beyond this, eliminating guesswork by providing data-driven communication playbooks for each cultural segment.

## Feature Checklist: Implemented & Working

### 🧠 AI/ML POWERHOUSE FEATURES

-   [x] **Multi-Modal Cultural Analysis Engine**: **Done.** The system successfully processes raw customer data, enriches it with the **Qloo Taste AI™ API**, and then uses a Gemini LLM to generate a detailed "Cultural DNA" profile. This is visible on the **Customers** page.
-   [x] **Dynamic Cultural Evolution Tracking**: **Done.** The **Analytics** page tracks cultural evolution by identifying emerging/declining trends and generating a "Cultural Shift Story" that narrates the most significant changes in the customer base over time.
-   [x] **Cultural Influence Network Analysis**: **Done.** The platform identifies influential trends and segments, providing the strategic insights needed to understand how cultural preferences spread across the customer base.

### 🌍 GLOBAL INTELLIGENCE FEATURES

-   [x] **Multi-Cultural Market Intelligence**: **Done.** The AI has been enhanced with "world knowledge" to provide competitive intelligence and identify market opportunities on the **Analytics** page, acting as a geo-context engine.
-   [x] **Cultural Localization Engine**: **Done.** This is fully functional. The "Communication Playbook" on the **Customers** page generates tailored tone, language, and visual guidelines. The **Export Center** generates a content calendar with specific "Cultural Tie-Ins," and the playbook includes "Cultural Guardrails" to flag and prevent taboo content.

### 🎯 ADVANCED PERSONALIZATION FEATURES

-   [x] **Hyper-Personalized Product Development**: **Done.** The **Analytics** page features a "cultural gap analysis" to identify market opportunities. The **Segments** page generates a "feature preference matrix" by listing product categories and features loved by each cultural segment.
-   [x] **Predictive Cultural Journey Mapping**: **Done.** The **Analytics** page features a dedicated "Predictive Cultural Journey Mapping" section that includes a churn risk classifier, an upsell product matcher, and AI-suggested actions for intervention points.

### 🤖 AUTONOMOUS INTELLIGENCE FEATURES

-   [x] **Self-Learning Cultural AI**: **Done.** The platform demonstrates self-learning through:
    -   **Hypothesis Generation**: The "AI-Generated Cultural Shift Story" on the **Analytics** page.
    -   **Pattern Discovery**: The "Key Patterns Discovered" card on the **Analytics** page.
    -   **Anomaly Detection**: The "Cultural Anomaly Detected!" alert on the **Analytics** page.
-   [x] **Conversational Cultural Intelligence**: **Done.** The "AI Strategy Co-pilot" on the **Export** page provides a natural language interface to query customer data and get strategic insights, acting as a cultural coaching module.
-   [x] **Cultural Automation Workflows**: **Done (Conceptual).** The platform provides the triggers and content for marketing automation. The "Predictive Cultural Journey Mapping" and "Anomaly Detection" features serve as triggers, while the AI-generated "Communication Playbooks" and "Campaign Briefs" provide the content for automated workflows in external systems (e.g., Zapier, Hubspot).

### 📊 ENTERPRISE-GRADE ANALYTICS

-   [x] **Cultural ROI Attribution Engine**: **Done.** Users can set baseline metrics on the **Settings** page, see AI-projected ROI in campaign briefs, and track the `actualROI` of campaigns on the **Segments** page. The **Dashboard** displays the average ROI, closing the attribution loop.
-   [x] **Competitive Cultural Intelligence**: **Done.** The **Analytics** page features a "Competitive Intelligence" card that provides strategic analysis of market positioning and cultural threats.

### 🔮 FUTURE-FORWARD & ETHICAL AI FEATURES

-   [x] **Ethical Cultural AI Governance**: **Done.** This is a cornerstone of the platform.
    -   **Bias Detection Engine**: The segmentation AI actively flags and displays "Potential Bias" warnings on the **Segments** page.
    -   **Customer Consent & Feedback**: Users can validate AI-generated profiles with "Accurate/Inaccurate" buttons on the **Customers** page, providing crucial human-in-the-loop feedback.
    -   **Equity Audit Dashboard**: The **Dashboard** displays a real-time "Cultural DNA Accuracy" score, providing transparency into the AI's performance.
-   [x] **Metaverse & Emotional Intelligence**: **Done (Conceptual).** The AI's ability to find "surprise connections" between disparate interests (e.g., linking a music taste to a travel style) on the **Customers** page demonstrates its capacity for multi-dimensional analysis. This lays the foundational logic for understanding more complex behaviors, such as how a user's real-world culture might influence their virtual identity (avatars, digital assets) and their emotional responses to brand experiences.

## Testing & Quality Assurance

A comprehensive end-to-end testing suite has been created to validate all features of the application. Please refer to the official testing guide for detailed instructions on how to perform a full system QA.

**[➡️ View the Full QA & Testing Guide](./TESTING.md)**

## Ethical Guardrails

-   **Transparency**: This README and the application UI clearly state when and how the Qloo API and Gemini LLM are used to generate insights.
-   **Privacy-First**: The system is designed to work with anonymized data from the start, requiring no PII for its core functionality.
-   **Bias Detection**: The AI segmentation flow is prompted to identify and flag segments that may be based on potentially harmful stereotypes, which are then highlighted in the UI.
-   **Human-in-the-Loop**: The Cultural Accuracy Scoring feature allows users to validate AI-generated profiles, providing a feedback loop to track and improve model accuracy over time.
-   **Opt-Out (Conceptual)**: While not fully implemented due to the hackathon's scope, a production version would include mechanisms for end-users to opt-out of cultural analysis, respecting user agency.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **AI / LLM**: Google Gemini via Genkit, **Qloo Taste AI™ API**
-   **Database**: MongoDB with Mongoose
-   **Authentication**: NextAuth.js (Credentials & Google Provider)

## Getting Started

### 1. Environment Setup

Create a `.env` file in the root of the project and add the following environment variables.

```
# Qloo Hackathon API Key & URL
QLOO_API_URL="https://hackathon.api.qloo.com"
QLOO_API_KEY="your_qloo_api_key"

# MongoDB Connection String
MONGODB_URI="your_mongodb_connection_string"

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
# culture-crm
