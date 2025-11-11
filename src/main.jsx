import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'   // 👈 React App utama kamu

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />                   // 👈 ini yang tampil di browser
  </React.StrictMode>
)
