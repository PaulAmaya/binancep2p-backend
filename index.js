const express = require("express");
const fileUpload = require('express-fileupload');
const cors = require("cors");
require("dotenv").config();

const db = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(fileUpload());

app.use(express.static('public'));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Binance P2P funcionando.");
});


db.sequelize.sync({ }) 
  .then(() => {
    console.log("Base de datos sincronizada con Sequelize.");

    require("./routes")(app); 

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  
  .catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
  });
