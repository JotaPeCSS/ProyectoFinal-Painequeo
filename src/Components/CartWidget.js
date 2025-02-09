import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext"; // Usamos el hook del contexto para acceder al carrito
import { doc, updateDoc, getDoc, collection, onSnapshot } from "firebase/firestore"; // Importamos Firebase para actualizar el stock
import { db } from "../firebase/firebaseConfig"; // Configuración de Firebase

const CartWidget = () => {
  const { cartItems, setCartItems } = useCart(); // Usamos el contexto del carrito para acceder a los productos
  const [products, setProducts] = useState([]); // Almacenamos los productos actualizados
  const [loading, setLoading] = useState(false); // Estado de carga para evitar múltiples operaciones simultáneas

  // Sincronización en tiempo real de productos con Firebase usando onSnapshot
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Productos"), (querySnapshot) => {
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList); // Actualiza la lista de productos en la UI
    });

    // Limpiamos la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Aumentar cantidad en el carrito y disminuir el stock en Firebase
  const increaseQuantity = async (product) => {
    if (loading) return; // Si estamos cargando, no hacer nada
    setLoading(true);

    const productRef = doc(db, "Productos", product.id);
    const productSnap = await getDoc(productRef); // Obtener el producto actual de Firebase

    if (productSnap.exists()) {
      const productData = productSnap.data();
      if (product.quantity < productData.stock) { // Solo aumentamos si hay suficiente stock
        // Actualizamos la cantidad en el carrito
        const updatedCart = cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedCart);

        // Reducir el stock en Firebase
        try {
          await updateDoc(productRef, { stock: productData.stock - 1 });

          // Actualizamos el stock de los productos en la UI
          setProducts((prevProducts) =>
            prevProducts.map((item) =>
              item.id === product.id ? { ...item, stock: item.stock - 1 } : item
            )
          );
        } catch (error) {
          console.error("Error al actualizar stock en Firebase:", error);
        }
      } else {
        alert("No hay suficiente stock para agregar más productos.");
      }
    } else {
      console.error("Producto no encontrado en Firebase");
    }

    setLoading(false);
  };

  // Función para disminuir la cantidad de un producto en el carrito y aumentar el stock en Firebase
  const decreaseQuantity = async (product) => {
    if (loading) return; // Si estamos cargando, no hacer nada
    setLoading(true);

    if (product.quantity > 1) {
      const productRef = doc(db, "Productos", product.id);
      const productSnap = await getDoc(productRef); // Obtener el producto actual de Firebase

      if (productSnap.exists()) {
        const productData = productSnap.data();

        // Actualizamos la cantidad en el carrito
        const updatedCart = cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        );
        setCartItems(updatedCart);

        // Aumentar el stock en Firebase
        try {
          await updateDoc(productRef, { stock: productData.stock + 1 });

          // Actualizamos el stock de los productos en la UI
          setProducts((prevProducts) =>
            prevProducts.map((item) =>
              item.id === product.id ? { ...item, stock: item.stock + 1 } : item
            )
          );
        } catch (error) {
          console.error("Error al restaurar stock en Firebase:", error);
        }
      } else {
        console.error("Producto no encontrado en Firebase");
      }
    } else {
      // Eliminar producto del carrito cuando la cantidad llega a 0
      removeFromCartHandler(product.id); // Eliminamos el producto del carrito
    }

    setLoading(false);
  };

  // Función para eliminar un producto del carrito y restaurar el stock en Firebase
  const removeFromCartHandler = async (productId) => {
    const removedProduct = cartItems.find((item) => item.id === productId);
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);

    // Restaurar el stock en Firebase
    if (removedProduct) {
      const productRef = doc(db, "Productos", productId);
      try {
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();
        await updateDoc(productRef, {
          stock: productData.stock + removedProduct.quantity, // Restauramos el stock en Firebase
        });

        // Actualizamos el stock en la UI de los productos
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === productId ? { ...item, stock: productData.stock + removedProduct.quantity } : item
          )
        );
      } catch (error) {
        console.error("Error al restaurar stock en Firebase:", error);
      }
    }
  };

  // Función para vaciar el carrito y restaurar el stock en Firebase
  const clearCart = async () => {
    if (!cartItems || cartItems.length === 0) return;

    // Para cada producto en el carrito, restauramos el stock en Firebase
    for (const item of cartItems) {
      const productRef = doc(db, "Productos", item.id);
      try {
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();
        await updateDoc(productRef, {
          stock: productData.stock + item.quantity, // Restaurar el stock en Firebase
        });

        // Actualizamos el stock de los productos en la UI
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === item.id ? { ...product, stock: product.stock + item.quantity } : product
          )
        );
      } catch (error) {
        console.error("Error al restaurar stock en Firebase:", error);
      }
    }

    setCartItems([]); // Limpiar el carrito
  };

  // Mostrar el total del carrito
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div
      style={{
        position: "absolute",
        right: "20px",
        top: "60px",
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        width: "320px",
        zIndex: 9999,
      }}
    >
      <h3>Carrito de Compras</h3>
      {cartItems.length > 0 ? (
        <div>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {cartItems.map((item) => (
              <li
                key={item.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{item.name}</strong> (x{item.quantity})
                  <p>Precio: ${item.price}</p>
                  <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                  <p>Stock: {products.find((p) => p.id === item.id)?.stock}</p> {/* Aquí mostramos el stock actualizado */}
                </div>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={() => increaseQuantity(item)} // Llamamos a la función para aumentar la cantidad
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      padding: "5px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => decreaseQuantity(item)} // Llamamos a la función para reducir la cantidad
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ➖
                  </button>
                  <button
                    onClick={() => removeFromCartHandler(item.id)} // Eliminar el producto
                    style={{
                      backgroundColor: "orange",
                      color: "white",
                      padding: "5px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h4>Total: ${totalAmount.toFixed(2)}</h4>
          <button
            onClick={clearCart} // Vaciar el carrito
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            Vaciar Carrito
          </button>
        </div>
      ) : (
        <p>El carrito está vacío</p>
      )}

      {cartItems.length > 0 && (
        <button
          onClick={() => alert("¡Compra realizada con éxito!")}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Comprar
        </button>
      )}
    </div>
  );
};

export default CartWidget;
