import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext"; // Importamos el hook del contexto del carrito

const Products = () => {
  const { products } = useCart(); // Usamos el hook para acceder a los productos desde el contexto
  const { addToCart } = useCart(); // Usamos el hook para acceder a la función addToCart

  const [loading, setLoading] = useState(true); // Estado de carga para los productos

  // Simulación de la carga de productos (esto sería reemplazado por la lógica de Firebase o una API)
  useEffect(() => {
    if (products.length > 0) {
      setLoading(false); // Una vez que los productos están disponibles, actualizamos el estado de carga
    }
  }, [products]);

  // Mientras se cargan los productos, mostramos un mensaje de "Cargando..."
  if (loading) {
    return <p>Cargando productos...</p>;
  }

  return (
    <div>
      <h2>Productos</h2>
      {/* Verifica si hay productos disponibles */}
      {products.length > 0 ? (
        products.map((product) => (
          <div key={product.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>{product.name}</h3>
            <p><strong>Precio:</strong> ${product.price}</p>
            <button
              onClick={() => addToCart(product)} // Llamamos a la función para agregar al carrito
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Añadir al carrito
            </button>
          </div>
        ))
      ) : (
        <p>No hay productos disponibles</p>
      )}
    </div>
  );
};

export default Products;
