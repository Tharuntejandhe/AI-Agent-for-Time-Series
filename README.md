# 🚀 Astro AI – Smart Offline Inventory Management System

Astro AI is a smart AI-agent-based inventory management system designed to transform raw stock data into **money-saving, actionable insights**. Developed as part of **Walmart Sparkathon 2025**, the project targets major retail pain points such as **overstocking, understocking,** and **product expiry**—challenges that directly affect financial performance.

With built-in forecasting, AI-powered recommendations, PDF reporting, and **offline LLM support using LLaMA 3**, Astro AI enables smarter decision-making for retail operations.

---

## 🎯 Key Features

- 📦 **Product Management**
  - Add, edit, filter, sort, and search products
  - View product urgency scores and expiry-based discount suggestions

- 📊 **Forecast Dashboard**
  - View AI-generated forecast graphs with product-wise analysis
  - Auto-adjust graphs for better visual clarity
  - **Download detailed PDF reports** with summaries

- 💬 **AI Chatbot**
  - Ask inventory-related questions and receive instant smart responses
  - Powered by LLaMA 3 running offline via Ollama

- 📈 **Smart Suggestions**
  - Product reorder recommendations based on urgency
  - Discount percentages based on expiry proximity
  - Seasonal trend-based restocking suggestions with quantity estimates

- 📴 **Offline Functionality**
  - Fully functional without internet—thanks to local LLaMA 3 integration

---

## 🧠 AI & Forecasting Strategy

Astro AI uses a hybrid forecasting approach, combining:
- **LSTM (via PyTorch)**
- **Facebook Prophet**
- **NeuralProphet**

Predictions from all three models are averaged to enhance accuracy and stability. Suggestions are generated based on urgency scores calculated from trend forecasts and expiry dates.

---

## 🛠️ Tech Stack

| Layer        | Technologies Used                                      |
|--------------|--------------------------------------------------------|
| Frontend     | React.js                                               |
| Backend      | FastAPI                                                |
| Database     | MySQL                                                  |
| Forecasting  | LSTM (PyTorch), Facebook Prophet, NeuralProphet       |
| PDF Reports  | WeasyPrint, ReportLab                                  |
| AI Chatbot   | LLaMA 3 via Ollama                                     |
| Deployment   | Uvicorn (for backend), npm (for frontend)              |

---

## 🗂 Project Architecture

<pre><code>``` astro-ai/ ├── frontend/ # React.js frontend interface │ └── build/ # Production build (copied to backend) ├── backend/ # FastAPI backend │ ├── main.py # FastAPI entry point │ ├── models/ # ML models for forecasting │ ├── llama3/ # LLaMA 3 chat integration │ ├── utils/ # Urgency scores, discount logic, PDF generation │ └── build/ # Frontend build served from backend ├── requirements.txt # Python backend dependencies ├── README.md # You're here! ``` </code></pre>
--- 

## Frontend run
- **cd frontend**
- **npm install**
- **npm run build**
- **Copy-Item -Recurse -Force "../frontend/build" "../backend/build"**

## Backend run
- **cd ../backend**
- **pip install -r requirements.txt**
- **uvicorn main:app --reload**
## Ollam run
- **ollama run llama3**
