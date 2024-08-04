# Pantry App

[![Pantry App](https://github.com/user-attachments/assets/114e3708-f658-41d1-9234-ca60ddc7a6ec)](https://pantry-app-911r.vercel.app/)

## Description

Pantry App is a web application designed to streamline your kitchen inventory management. With an intuitive interface, it allows users to effortlessly track pantry items, create shopping lists, and efficiently plan meals. This app aims to simplify your kitchen organization and reduce food waste by providing a clear overview of your available ingredients.

## Features

- Track your pantry items
- Create shopping lists
- Generate meal suggestions based on available ingredients
- Manage recipes

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pantry-app.git
   cd pantry-app
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```
   You can obtain these values by creating a Firebase project at [https://firebase.google.com/](https://firebase.google.com/)

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Technologies Used

- Next.js
- React
- Firebase
- Tailwind CSS
- Framer Motion
- React Camera
- ChatGPT Vision

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
