'use client';
import React, { useState, useEffect } from "react";

export default function Page() {
  const [data, setData] = useState({ message: "", respuesta: "" });

  useEffect(() => {
    async function fetchContenido() {
      try {
        const response = await fetch("/api/testing");
        if (response.ok) {
          const data = await response.json();
          console.log("Data:", data.data);
          setData(data.data);
        } else {
          console.error("No se pudo obtener el contenido del archivo.");
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error);
      }
    }

    fetchContenido();
  }, []);

  return (
    <div>
      <h1>Contenido del archivo de texto</h1>
      <p>{data.message}</p>
      <pre>{data.respuesta}</pre>
    </div>
  );
}
