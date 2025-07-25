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

## The Solution: Understand the "Why" Behind the Buy

Our Cultural Intelligence CRM platform moves beyond outdated demographics to reveal the cultural drivers behind customer behavior. An insight like **"Eco-conscious indie enthusiasts"** is far more actionable and predictive than **"25-35 year olds in NYC."** It eliminates the guesswork by providing data-driven communication playbooks for each cultural segment.

## Core Features

- **Customer Data Import**: Upload anonymized customer data via CSV. The system processes, cleans, and standardizes the data for analysis.
- **Multi-Modal Cultural Analysis Engine**:
    - **Cultural DNA Generation (Qloo + LLM)**: Leverages the Qloo API to fetch cultural affinity data. An LLM then analyzes this data alongside simulated multi-modal signals (like sentiment from product reviews, seasonal purchase timing, and brand engagement patterns) to generate a rich "Cultural DNA" profile for each customer, including surprising connections.
    - **Computer Vision, NLP, and Behavioral Analytics**: The AI is prompted to act as a sophisticated engine that synthesizes these varied data points into a unified cultural score, providing a holistic view of the customer.
- **Customer Profile Explorer**: View a list of all processed customer profiles, each enriched with their unique Cultural DNA. Features an interactive visualization and accuracy feedback mechanism.
- **AI-Powered Segmentation**: Automatically group customers into 8-12 distinct cultural segments based on their shared affinities. Each segment is presented as a detailed persona card, ranked by business opportunity. Includes bias detection warnings.
- **Predictive Analytics Dashboard**: Generate a real-time report that analyzes all customer profiles to identify market trends, make predictions, and uncover opportunities. Features the "Cultural Shift Story Generator" which crafts a narrative around the most significant trend.
- **Actionable Strategy Generation**:
    - **Communication Strategy**: Generate tailored communication strategies for individual customer profiles.
    - **Campaign Briefs**: Create comprehensive, exportable campaign briefs for specific segments, complete with projected ROI.
    - **Sales Scripts**: Generate customized sales scripts with talking points and objection handling for any cultural segment.
    - **Content Calendar**: Create a 30-day content calendar based on the overall cultural trends of the customer base.
- **Settings & ROI Simulation**: Input baseline business metrics (LTV, CPA, Conversion Rate) which the AI uses to provide more accurate ROI projections in its generated strategies.
- **Performance Tracking**: Input actual campaign ROI for a cultural segment to track and prove the value of cultural targeting over time.
- **Conversational Cultural Intelligence**: A natural language interface that allows users to ask questions about their customer data and receive narrative answers from an AI co-pilot.
- **Emotional Cultural Intelligence**: A forward-looking capability where the AI is primed to analyze how culture affects emotional responses, identifies emotional triggers for each segment, and maps the emotional journey of a customer.
- **Cultural Intelligence for the Metaverse**: A forward-looking capability where the AI is primed to analyze cultural expressions in virtual spaces (e.g., avatars, virtual goods) to provide insights for brands engaging in the metaverse.
- **Cultural Intelligence API Marketplace**: A forward-looking capability where the platform could connect with external cultural data sources (e.g., Spotify, Netflix), third-party APIs, and data exchanges to create an even richer understanding of the customer.

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
