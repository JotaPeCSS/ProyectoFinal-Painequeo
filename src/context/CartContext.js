import React, { createContext, useState, useEffect, useContext } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Crear el contexto
const CartContext = createContext();

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Productos"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (product) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    const productRef = doc(db, "Productos", product.id);
    try {
      await updateDoc(productRef, { stock: product.stock - 1 });
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, stock: p.stock - 1 } : p
        )
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  const removeFromCart = async (productId) => {
    const removedProduct = cartItems.find((item) => item.id === productId);
    setCartItems(cartItems.filter((item) => item.id !== productId));

    if (removedProduct) {
      const productRef = doc(db, "Productos", productId);
      try {
        await updateDoc(productRef, { stock: removedProduct.stock + removedProduct.quantity });
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === productId ? { ...p, stock: p.stock + removedProduct.quantity } : p
          )
        );
      } catch (error) {
        console.error("Error al restaurar stock:", error);
      }
    }
  };

  const increaseQuantity = async (product) => {
    if (product.stock > 0) {
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );

      const productRef = doc(db, "Productos", product.id);
      try {
        await updateDoc(productRef, { stock: product.stock - 1 });
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, stock: p.stock - 1 } : p
          )
        );
      } catch (error) {
        console.error("Error al actualizar stock:", error);
      }
    }
  };

  const decreaseQuantity = async (product) => {
    setCartItems((prevCart) =>
      prevCart
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    setTimeout(async () => {
      const productRef = doc(db, "Productos", product.id);
      try {
        await updateDoc(productRef, { stock: product.stock + 1 });
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, stock: p.stock + 1 } : p
          )
        );
      } catch (error) {
        console.error("Error al restaurar stock:", error);
      }
    }, 1000);
  };

  return (
    <CartContext.Provider
      value={{
        products,
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        setCartItems,
        setProducts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => useContext(CartContext);
