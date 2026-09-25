import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme/cinebook.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// The live site keeps the console quiet: debug logs can include booking and
// account details. Warnings and errors still show.
if (process.env.NODE_ENV === 'production') {
  console.log = console.info = console.debug = () => {};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
