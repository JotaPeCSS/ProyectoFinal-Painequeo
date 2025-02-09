// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Asegúrate de que esta ruta esté correcta dependiendo de tu estructura de carpetas
import "./styles/index.css"; // Si tienes un archivo de estilo global, asegúrate de importarlo también
import { BrowserRouter as Router } from "react-router-dom"; // Si estás utilizando React Router para la navegación

const root = ReactDOM.createRoot(document.getElementById("root")); // Verifica que el ID sea "root" en tu HTML

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
