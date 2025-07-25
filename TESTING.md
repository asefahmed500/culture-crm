# End-to-End QA Testing Suite

This document provides a comprehensive checklist and test prompts to validate every module of the Cultural Intelligence CRM. Use these manual and AI-driven tests to ensure functionality, UI integrity, and the proper flow of the data pipeline.

---

## 🧠 MULTI-MODAL CULTURAL ANALYSIS ENGINE

### ✅ Test Prompt:

> "Upload this sample customer dataset with diverse demographics (CSV), and generate Cultural DNA for all entries."

### 🔍 Checkpoints:

*   [ ] **CSV Upload & Parsing**: Navigate to the **Customer Import** page. Upload a sample CSV. Confirm that columns are parsed correctly and can be mapped to the required system fields.
*   [ ] **Qloo & AI Enrichment**: After processing, navigate to the **Customers** page. Verify that new profiles have been created.
*   [ ] **Cultural DNA Rendering**: For each new profile, open the "View DNA" dialog. Confirm that the radar chart, preferences, and "Surprising Connections" are all rendered correctly.
*   [ ] **Feedback Loop**: Test the "Accurate" / "Inaccurate" buttons and verify that the "Cultural DNA Accuracy" score on the **Dashboard** updates.

---

## 🔄 DYNAMIC CULTURAL EVOLUTION TRACKING

### ✅ Test Prompt:

> "After importing data, navigate to the Analytics page and generate a trend report."

### 🔍 Checkpoints:

*   [ ] **Analytics Page Load**: Ensure the **Analytics** page loads without API failures.
*   [ ] **Trend Generation**: Click "Generate Trend Report." The process should complete without errors.
*   [ ] **Cultural Shift Story**: Verify that the "AI-Generated Cultural Shift Story" card populates with a title, narrative, data points, and a recommendation.
*   [ ] **Trend Data**: Check that the "Top 5 Emerging Interests" and "Top 5 Declining Interests" cards populate with relevant data.

---

## 🌐 MULTI-CULTURAL MARKET INTELLIGENCE

### ✅ Test Prompt:

> "Generate an Analytics report and review the Competitive Intelligence and Market Opportunity Gaps."

### 🔍 Checkpoints:

*   [ ] **Competitive Intelligence**: The AI should generate strategic insights in the "Competitive Intelligence" card on the **Analytics** page.
*   [ ] **Market Gaps**: The "Market Opportunity Gaps" card should provide actionable insights based on the AI's analysis of the customer data.
*   [ ] **Geo-Context Simulation**: The AI's analysis should demonstrate "world knowledge," providing insights that can be applied to different market contexts even without explicit geo-data.

---

## 🎯 CULTURAL LOCALIZATION ENGINE

### ✅ Test Prompt:

> "For a specific customer profile, generate a Communication Playbook. Then, generate a Content Calendar from the Export Center."

### 🔍 Checkpoints:

*   [ ] **Communication Playbook**: On the **Customers** page, confirm the generated playbook includes specific advice for tone, language, and visuals.
*   [ ] **Cultural Guardrails**: Verify that the "DOs" and "DON'Ts" sections are populated with clear, actionable guidance.
*   [ ] **Content Calendar**: On the **Export Center** page, confirm the generated calendar includes a "Cultural Tie-In" for each post, simulating a cultural calendar API.
*   [ ] **Export Functionality**: Ensure the "Download as CSV" button for the content calendar works correctly.

---

## 🛍️ HYPER-PERSONALIZED PRODUCT DEVELOPMENT

### ✅ Test Prompt:

> "Generate customer segments and review the 'Loved Product Categories & Features' for each."

### 🔍 Checkpoints:

*   [ ] **Feature Preference Matrix**: On the **Segments** page, after generation, each segment card should display a list of product categories and features under "Loved Product Categories & Features," acting as a preference matrix.
*   [ ] **Gap Analysis**: On the **Analytics** page, the "Market Opportunity Gaps" card should function as a cultural gap analysis, identifying underserved needs.

---

## 🔮 PREDICTIVE CULTURAL JOURNEY MAPPING

### ✅ Test Prompt:

> "Generate an Analytics report and review the 'Predictive Cultural Journey Mapping' section."

### 🔍 Checkpoints:

*   [ ] **Prediction Cards**: All four prediction cards (Upsell, Advocacy, Purchase, Churn Risk) on the **Analytics** page should populate correctly.
*   [ ] **Churn Risk Classification**: The "Cultural Churn Risk" card should display a segment, a prediction, a confidence score, and a recommended action.
*   [ ] **Upsell Matcher**: The "Upsell Opportunity" card should function as a culture-aligned product matcher, suggesting relevant product categories.
*   [ ] **AI-Suggested Actions**: Each prediction card must include an "Actionable Recommendation" to guide user intervention.

---

## 🧠 SELF-LEARNING CULTURAL AI

### ✅ Test Prompt:

> "Generate a new Analytics report and observe the self-learning outputs."

### 🔍 Checkpoints:

*   [ ] **Hypothesis Generation**: The **Analytics** page must display the "AI-Generated Cultural Shift Story" card, which serves as an automated hypothesis.
*   [ ] **Pattern Discovery**: The "Key Patterns Discovered" card must highlight non-obvious correlations from the customer data.
*   [ ] **Anomaly Detection**: If a significant trend shift is present in the data, the "Cultural Anomaly Detected!" alert should appear at the top of the report.

---

## 🗣️ CONVERSATIONAL CULTURAL INTELLIGENCE

### ✅ Test Prompt:

> "Go to the Export Center and ask the AI Co-pilot: 'What are the top 3 most promising segments and why?'"

### 🔍 Checkpoints:

*   [ ] **AI Co-pilot Response**: The co-pilot should provide a clear, well-reasoned answer by synthesizing data from the `getCustomerSegments` tool.
*   [ ] **Tool-Based Responses**: The AI should correctly use its tools to answer questions about the entire customer base (using profiles) or specific segments.
*   [ ] **Follow-up Questions**: The co-pilot should be able to handle follow-up questions that elaborate on its initial response.
*   [ ] **UI Integrity**: The chat input and response area should be clearly delineated and easy to use.

---

## 📊 CULTURAL ROI ATTRIBUTION ENGINE

### ✅ Test Prompt:

> "Set baseline metrics, generate a campaign brief, and then log the actual ROI for that campaign."

### 🔍 Checkpoints:

*   [ ] **Set Baselines**: Navigate to the **Settings** page and save values for LTV, CPA, and Conversion Rate.
*   [ ] **Projected ROI**: Generate a "Campaign Brief" from the **Export Center**. The "Projected Impact" section should reflect the baseline numbers you set.
*   [ ] **Track Actual ROI**: Go to the **Segments** page, click "Track Performance" on a segment, and save a numerical ROI value.
*   [ ] **Dashboard Update**: Navigate to the **Dashboard**. The "Avg. Campaign ROI" card should update to reflect the value you just entered.

---

## 🥷 COMPETITIVE CULTURAL INTELLIGENCE

### ✅ Test Prompt:

> "Generate an Analytics report and review the 'Competitive Intelligence' card."

### 🔍 Checkpoints:

*   [ ] **Strategic Insights**: The card should contain a qualitative analysis of the market landscape based on cultural trends.
*   [ ] **Actionable Advice**: The AI's output should suggest how the business can position itself to gain a competitive advantage.
*   [ ] **Threat Identification**: The analysis should implicitly identify cultural threats, such as trends moving away from the company's current offerings.

---

## 🔐 ETHICAL CULTURAL AI GOVERNANCE

### ✅ Test Prompt:

> "Generate segments and check for bias warnings. Then, submit feedback on a customer's Cultural DNA."

### 🔍 Checkpoints:

*   [ ] **Bias Warnings**: The **Segments** page should show a "Potential Bias" warning badge on any segments that rely on potentially stereotypical correlations.
*   [ ] **User Feedback**: The **Customers** page "View DNA" dialog must contain working "Accurate" / "Inaccurate" buttons.
*   [ ] **Equity Audit Dashboard**: The **Dashboard** must display the "Cultural DNA Accuracy" score, and this score must change after submitting feedback.

---

## 🧬 METAVERSE + EMOTIONAL INTELLIGENCE (Conceptual)

### ✅ Test Prompt:

> "Review a customer's Cultural DNA profile and find 'Surprising Connections'."

### 🔍 Checkpoints:

*   [ ] **Surprising Connections**: The AI should identify and list non-obvious connections between different cultural preferences (e.g., linking a music taste to a travel style).
*   [ ] **Foundation for Deeper Insight**: These connections should demonstrate the AI's ability to find multi-dimensional links, laying the conceptual groundwork for understanding more complex emotional or metaverse behaviors.
*   [ ] **Co-Pilot Explanation**: The AI Co-pilot should be able to elaborate on why these "surprise connections" might be strategically important if asked.

---

## 💻 API + UI Integration Checklist

### 🔧 API Tests

*   [ ] All `fetch` calls to `/api/...` routes should return `2xx` status codes on valid requests.
*   [ ] API routes should handle invalid inputs gracefully (e.g., return `400` or `500` with a clear error message).
*   [ ] The application should remain functional even if an external API call (like to Qloo) fails, providing a clear error message to the user.

### 🎨 UI Tests

*   [ ] **Responsiveness**: All pages should be usable on both desktop and mobile screen sizes without layout breaks.
*   [ ] **State Handling**: The UI should correctly display loading states (spinners, skeletons) when data is being fetched or processed.
*   [ ] **Error Handling**: API or processing errors should be displayed to the user in a clear and understandable format (e.g., in an Alert component).
*   [ ] **Empty States**: Pages that display data (Customers, Segments) should show a helpful message when no data is available (e.g., "No customer profiles found").
*   [ ] **Interactive Elements**: All buttons, dropdowns, dialogs, and tooltips should be functional and trigger the correct actions.
