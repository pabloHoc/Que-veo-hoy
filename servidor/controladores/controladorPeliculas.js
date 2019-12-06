var conexion = require('../lib/conexionbd'); //importamos la conexión a la base de datos
function obtenerListado(req, res) {
    //agregamos los filtros y los valores correspondientes que llegan en la request
    //si en la request nos llega como parametro la cantidad de resultados a devolver, seteamos el limite que corresponde, sino definimos que
    //van a ser 52 resultados
    if (req.query.cantidad) {
        var limite = req.query.cantidad;
    } else {
        var limite = 52;
    }
    //si en la request nos llega como parametro el numero de pagina, seteamos la primer fila que se va a devolver sino definimos que
    //van a ser la fila 0.
    if (req.query.pagina) {
        var inicio = (req.query.pagina - 1) * limite;
    } else {
        var inicio = 0;
    }
    //inicializamos los filtros y vamos agregando los parametros por los cuales se va a filtrar si los mismo llegaron como parametro en la request
    var filtros = "";
    if (req.query.titulo) {
        filtros += " AND pelicula.titulo LIKE '" + req.query.titulo + "%'";
    }

    if (req.query.genero) {
        filtros += " AND pelicula.genero_id = " + req.query.genero;
    }

    if (req.query.anio) {
        filtros += " AND pelicula.anio = " + req.query.anio;
    }

    if (req.query.columna_orden) {
        var col = "pelicula." + req.query.columna_orden;
    } else {
        var col = "pelicula.titulo";
    }

    if (req.query.tipo_orden) {
        var tipo = req.query.tipo_orden;
    } else {
        var tipo = "ASC"
    }

    var sql = "SELECT * from pelicula WHERE 1=1" + filtros + " ORDER BY " + col + " " + tipo + " LIMIT " + inicio + "," + limite;
    //ejecutamos la consulta para obtener las peliculas que correspondan segun los filtros y parametros recibidos
    conexion.query(sql,
        function(error, resultado_peliculas, fields) {
            //luego de finalizar la ejecución de la primer consulta, realizamos una segunda para obtener el total de películas
            //en la base de datos, dato que nos va a servir para calcular la cantidad de páginas necesarias para mostrar todas las películas
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.send(404, {
                    error: true,
                    mensaje: error.message
                });
            }
            var sql2 = "SELECT COUNT (*) AS total from pelicula WHERE 1=1 " + filtros
            conexion.query(sql2,
                function(error, total, fields) {
                    if (error) {
                        console.log("Hubo un error en la consulta", error.message);
                        return res.send(404, {
                            error: true,
                            mensaje: error.message
                        });
                    }
                    //agregamos a la respuesta el total de películas
                    var respuesta = {
                        'total': total[0].total
                    };
                    //agregamos a la respuesta los datos de las películas
                    respuesta.peliculas = resultado_peliculas;
                    res.send(JSON.stringify(respuesta));

                });
        });
}

function obtenerPelicula(req, res) {
    //primer consulta para obtener datos de la película
    var sql = "SELECT * FROM pelicula join genero on pelicula.genero_id = genero.id WHERE pelicula.id = " + req.params.id
    conexion.query(sql,
        function(error, pelicula, fields) {
            //luego de finalizar la primer consulta, realiazamos una segunda para obtener los datos de los actores
            conexion.query('SELECT nombre from pelicula JOIN actor_pelicula on pelicula.id = actor_pelicula.pelicula_id JOIN actor on ' +
                '    = actor.id where pelicula.id = ' + req.params.id,
                function(error, actores, fields) {
                    if (error) {
                        console.log('Hubo un error en la query', error.message);
                        return res.send(500, {
                            error: true,
                            mensaje: error.message
                        });
                    }
                    var respuesta = {
                        'pelicula': pelicula[0]
                    };
                    respuesta.actores = actores;
                    //si no se encontro ninguna película con el ID correspondiente, envaiamos un mensaje de error
                    if (pelicula.length == 0) {
                        console.log("No se encontro pelicula");
                        return res.send(404, {
                            error: true,
                            mensaje: 'No se encontro pelicula'
                        });
                    } else {
                        res.send(JSON.stringify(respuesta));
                    }
                });
        });
}

function obtenerGeneros(req, res) {
    //realizamos una consulta que nos devuelva todos los géneros
    conexion.query("SELECT * FROM genero", function(error, generos, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.send(500, {
                error: true,
                mensaje: error.message
            });
        }
        var respuesta = {
            'generos': generos
        };
        res.send(JSON.stringify(respuesta));
    });
}

function recomendarPelicula(req, res) {
    var filtros = " ";
    if (req.query.genero) {
        filtros += " AND genero.nombre LIKE '%" + req.query.genero + "%'";
    }

    if (req.query.anio_inicio && req.query.anio_fin) {
        filtros += " AND pelicula.anio BETWEEN " + req.query.anio_inicio + " AND " + req.query.anio_fin;
    }

    if (req.query.puntuacion) {
        filtros += " AND pelicula.puntuacion >" + req.query.puntuacion;
    }
    var sql = "SELECT pelicula.titulo, pelicula.poster, pelicula.trama, pelicula.id, genero.nombre FROM pelicula JOIN genero ON pelicula.genero_id = genero.id " +
        " WHERE 1=1 " + filtros;

    conexion.query(sql, function(error, peliculas, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.send(500, {
                error: true,
                mensaje: error.message
            });
        }
        var respuesta = {
            'peliculas': peliculas
        };
        res.send(JSON.stringify(respuesta));
    });
}

//Definimos todas las funciones que queremos exportar
module.exports = {
    obtenerListado: obtenerListado,
    obtenerPelicula: obtenerPelicula,
    obtenerGeneros: obtenerGeneros,
    recomendarPelicula: recomendarPelicula

};