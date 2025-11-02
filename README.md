# Pantry Pal 🥦

**An intelligent kitchen assistant that turns a photo of your ingredients into a custom-made recipe.**

Description changes. 

Pantry Pal is a smart meal planning application designed to solve the common problem: "What can I make with the food I already have?" It uses powerful AI to analyze your pantry's contents and suggests delicious recipes, helping you reduce food waste and discover new meal ideas.

**Note:** After deploying, replace the link below with your live GitHub Pages URL!
**[Live Demo Here](https://your-username.github.io/pantry-pal/)** 👈

---

## ✨ Key Features

*   **🤖 AI-Powered Inventory:** Simply take a photo of your fridge or pantry, and the app's AI automatically creates a digital list of your ingredients.
*   **🍳 Custom Recipe Generation:** Get recipe suggestions based on your available items. Specify the meal type (Breakfast, Lunch, Dinner) and number of servings.
*   **📚 Meal History & Favorites:** Automatically saves every recipe you generate. Mark your favorites with a star to create a personalized digital cookbook.
*   **📱 Mobile-First PWA:** Install the app on your phone's home screen directly from your browser for a native app-like experience.
*   **🌍 Multi-Language Support:** The interface and recipes are available in English, French, German, and Hebrew.
*   **💾 Import/Export:** Easily back up and restore your pantry list with a JSON file.

---

## 📱 How to Use on Your Mobile Device

This application is a **Progressive Web App (PWA)**. You don't need an app store; you can install it right from your browser for easy access.

#### On iOS (iPhone/iPad):
1.  Open the app's URL in the **Safari** browser.
2.  Tap the **Share** button (the square icon with an arrow pointing up).
3.  Scroll down and tap on **"Add to Home Screen"**.
4.  Confirm the name, and the Pantry Pal icon will appear on your home screen.

#### On Android:
1.  Open the app's URL in the **Chrome** browser.
2.  A prompt should appear to **"Add Pantry Pal to Home screen"**. Tap it.
3.  If you don't see the prompt, tap the **three-dot menu icon** in the corner and select **"Install app"** or **"Add to Home Screen"**.

---

## 🔮 How the AI Works (The Magic Behind the Scenes)

The intelligence in this app is powered by **Google's Gemini model**, which is excellent at understanding both images and text. The AI performs two main jobs:

#### 1. Analyzing Your Pantry from a Photo
*   **What you do:** You take a picture of your food.
*   **What the app does:** It sends that image to the Gemini AI with a specific instruction (a "prompt") like:
    > "Analyze this image. Identify all distinct food items. Respond ONLY with a comma-separated list of the items."
*   **The Result:** The AI looks at the image, identifies items like "milk," "eggs," and "cheese," and sends back a simple text string: `milk, eggs, cheese, bread`. The app then neatly adds these items to your "My Pantry" list.

#### 2. Generating a Custom Recipe
*   **What you do:** You select your meal preferences and click "Generate Recipe."
*   **What the app does:** It sends your current inventory list to the Gemini AI with another prompt.
*   **The Smart Part:** To ensure the recipe is perfectly formatted every time, the app tells the AI to respond in a structured `JSON` format. It provides a blueprint for the answer, guaranteeing that the recipe name, description, ingredients, and instructions are always separate and cleanly organized.
*   **The Result:** The AI generates a clean, structured object containing the recipe details. The app receives this data and uses it to display the full recipe in the user interface.

---

## 🛠️ Tech Stack

*   **Frontend:** [React](https://react.dev/) with TypeScript
*   **AI Model:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Deployment:** [GitHub Pages](https://pages.github.com/) with GitHub Actions

---

## 🚀 Getting Started (For Developers)

Want to run this project locally? Follow these steps.

### Prerequisites
*   Node.js (v18 or higher)
*   npm

### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/pantry-pal.git
    cd pantry-pal
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) (or the address provided) to view it in your browser.

---

## ☁️ Deployment

This project is configured for easy deployment to **GitHub Pages**. A GitHub Actions workflow is included in `.github/workflows/deploy.yml`. When you push changes to the `main` branch, it will automatically build the application and deploy it.