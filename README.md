# Habit Tracker

A modern web application for tracking daily habits, managing your time with productivity timers, and keeping notes.

![Screenshot of Habit Tracker](https://via.placeholder.com/800x400?text=Habit+Tracker+Screenshot)

## Features

- **Daily Habit Tracking**: Create and track up to 5 daily habits
- **Streaks**: Track your consistency with streak counting
- **Pomodoro Timer**: Stay productive with customizable pomodoro sessions (25/5 or 50/15)
- **Eye Care Timer**: Implement the 20-20-20
rule to reduce eye strain
- **Notes**: Keep track of ideas and tasks
- **Calendar View**: Visualize your habit completion history
- **Multiple Profiles**: Switch between different user profiles
- **PWA Support**: Install as a standalone app on mobile and desktop

## Known Issues

Timer Bug: There is a known issue where the timer may not start correctly when the Start/Stop button is clicked multiple times rapidly. This is due to the state management logic that controls the start and stop states. I'm actively working on a fix to address this issue and improve the timer's functionality.

## Technologies Used

- React 18
- React Router
- Context API for state management
- Tailwind CSS for styling
- Local Storage for data persistence
- PWA (Progressive Web App) features

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/[your-username]/habit-tracker.git
   cd habit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or if you use yarn:
   ```
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   or with yarn:
   ```
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
habit-tracker/
├── public/               # Static files
│   ├── favicon.ico
│   ├── manifest.json
│   └── logo192.png
├── src/
│   ├── components/
│   │   ├── common/       # Reusable UI components
│   │   ├── DailyGoals/   # Habit tracking components
│   │   ├── Notes/        # Notes feature components
│   │   └── Timers/       # Timer components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── App.jsx           # Main App component with routing
│   └── main.jsx          # Entry point
├── index.html
├── package.json
└── README.md
```

## Local Storage

This app uses the browser's localStorage to persist data, including:
- User habits and completion status
- Streaks information
- Timer settings
- Notes
- User profiles

## Building for Production

To create a production build:

```
npm run build
```

or with yarn:

```
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

The app can be deployed to any static site hosting service like Netlify, Vercel, or GitHub Pages.

Example deployment to Netlify:

1. Create a Netlify account if you don't have one
2. Build your project: `npm run build`
3. Drag and drop the `dist` folder to Netlify's upload area, or connect your GitHub repository

## Future Improvements

- Add authentication
- Cloud synchronization for data
- Social sharing features
- Statistics and analytics
- Customizable themes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

© 2025 Mathias Zeibig. All Rights Reserved.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
