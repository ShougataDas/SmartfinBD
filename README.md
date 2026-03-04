# SmartFinBD - AI-Powered Investment Mentor for Bangladesh 🇧🇩

> **SmartFinBD** is a cross-platform mobile application designed to democratize financial planning for individuals in Bangladesh. By combining modern financial analytics with AI-driven personalization, the app helps users assess their financial health, generate personalized investment plans, and receive guidance via a bilingual AI chatbot.

**🔗 Backend Repository:** [smartfinbd-backend](https://github.com/midul9797/smartfinbd-backend)

---

## 📱 Project Overview

In Bangladesh, many individuals face challenges in planning their investments due to limited access to personalized financial advisory services. SmartFinBD bridges this gap by providing an intuitive mobile interface that combines local market insights with AI-powered guidance.

### Key Features

* **🤖 Bilingual AI Chatbot:** A financial assistant capable of conversing in both Bengali and English to answer user queries
* **📊 Interactive Dashboard:** Real-time visualization of investment growth, financial health, and asset allocation using dynamic charts
* **💼 Personalized Investment Plans:** AI-generated recommendations for government bonds, mutual funds, DPS, and the stock market tailored to the user's risk profile
* **🔐 Biometric Authentication:** Secure login integration using fingerprint scanning
* **📉 Risk Assessment:** Algorithms to evaluate user data (age, income, goals) and determine risk tolerance

---

## 🛠️ Tech Stack (Frontend)

This repository contains the **Frontend** source code, built with a focus on performance and cross-platform compatibility.

* **Framework:** React Native (TypeScript)
* **Navigation:** React Navigation
* **State Management:** Redux Toolkit
* **Data Visualization:** Victory Native / Recharts
* **API Integration:** Axios (connecting to Node.js/Firebase backend)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* Android Studio (for Android Emulator)
* Xcode (for iOS Simulator - Mac only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShougataDas/SmartfinBD.git
   cd SmartfinBD
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory and add your backend API URL and other keys:
   ```env
   API_URL=http://localhost:5000/api
   ```

4. **Run the Application**
   
   * **Android:**
     ```bash
     npx react-native run-android
     ```
   
   * **iOS:**
     ```bash
     cd ios && pod install && cd ..
     npx react-native run-ios
     ```

---

## 👥 Contributors

This project was developed for the **Mobile App Development (CSE 464)** course at **East Delta University**.

* **Shougata Das** - Frontend Development
* **Moklasur Rahman** - Backend Integration

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ShougataDas/SmartfinBD/issues).

## 📧 Contact

For questions or feedback, please reach out to the project maintainers through GitHub.
