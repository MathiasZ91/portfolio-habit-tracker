# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh




# React App Structure Explained for Junior Developers

## index.html
- The only actual HTML file in your project
- Contains a single `<div id="root"></div>` where React mounts your app
- Browser loads this file first

## main.jsx (or index.js)
- The entry point of your React application
- Imports React and ReactDOM
- Connects your React app to the HTML by rendering to the root div
- Responsible for mounting your App component to the DOM

## App.jsx
- Your main application component
- Acts as the container for all other components
- Sets up primary routes and layouts
- The "shell" of your application

## Components
- Reusable UI pieces
- Each component handles a specific part of the interface
- Components can contain other components
- Make your code organized and maintainable
- Can be shared across different parts of your app

## Data Flow
- Props: Pass data down from parent to child components
- State: Components can have internal data that affects rendering
- Events: Components respond to user actions with event handlers

This structure allows you to build complex applications from simple, reusable pieces while maintaining clean separation of concerns.