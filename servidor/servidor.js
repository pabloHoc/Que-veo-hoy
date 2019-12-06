//importamos todos los paquetes que necesitamos
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controladorPeliculas = require('./controladores/controladorPeliculas');
var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//seteamos las funciones que se van a ejecutar cuando se llame a las rutas correspondientes
app.get('/peliculas/recomendacion', controladorPeliculas.recomendarPelicula);
app.get('/peliculas', controladorPeliculas.obtenerListado);
app.get('/peliculas/:id', controladorPeliculas.obtenerPelicula);
app.get('/generos', controladorPeliculas.obtenerGeneros);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});

