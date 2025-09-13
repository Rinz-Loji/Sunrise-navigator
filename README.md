# Sunrise Navigator

Sunrise Navigator is an intelligent alarm clock and productivity application designed to provide a personalized and efficient start to your day. It goes beyond a simple alarm by delivering a comprehensive morning briefing tailored to your specific needs, including real-time weather, live traffic updates for your commute, top news headlines, and a dose of motivation.

## Features

- **Smart Alarm Setup**: Set your desired wake-up time and configure your locations.
- **Address Validation**: Ensures that the entered home and  work are real-world addresses using the Google Maps Geocoding API.
- **Intelligent Time Adjustment**: Before the alarm "rings," the app checks for traffic delays and can suggest an earlier wake-up time to ensure you're always on schedule.
- **Comprehensive Morning Briefing**: When the alarm is simulated, you receive a full-screen dashboard with:
    - **Live Weather**: Current temperature and conditions for your specified location.
    - **Real-time Traffic**: Up-to-date commute time, delays, and suggestions for your route.
    - **Top News Headlines**: A summary of the latest top stories.
    - **Motivational Quote**: An AI-generated motivational quote to inspire you for the day ahead.
- **Customizable Alarm Sounds**: Choose from a selection of alarm tones.
- **Theming**: Switch between a light and dark theme to suit your preference.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [React](https://reactjs.org/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) powered by Google's Gemini models for motivational quote generation.
- **Form Management**: [React Hook Form](https://react-hook-form.com/) for robust and accessible forms.
- **Schema Validation**: [Zod](https://zod.dev/) for type-safe validation of forms and API responses.

## APIs Used

- **Google Maps API**:
    - **Geocoding API**: Used to validate and format user-entered addresses.
    - **Distance Matrix API**: Used to fetch real-time and historical traffic data for commute time estimation.
- **OpenWeatherMap API**: Provides current weather data for any specified location.
- **NewsAPI**: Fetches top news headlines from a variety of sources.
- **Google AI (Gemini)**: The underlying LLM used by Genkit to generate unique motivational quotes.
