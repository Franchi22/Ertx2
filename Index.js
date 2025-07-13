const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send("🌐 Backend activo en Render para ERTX");
});

// Ruta que recibirá los datos de RockBLOCK
app.post('/rockblock', (req, res) => {
  console.log("📡 Datos recibidos desde RockBLOCK:");
  console.log(req.body); // Puedes agregar validaciones aquí

  // ✅ IMPORTANTE: responder 200 OK
  res.status(200).send("OK");
});

// 👇 Esta línea es fundamental para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
