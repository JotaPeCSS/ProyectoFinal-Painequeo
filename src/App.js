import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NavBar from "./Components/NavBar";
import CartWidget from "./Components/CartWidget";

function App() {
  return (
    <CartProvider>
      <NavBar />
      <CartWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
