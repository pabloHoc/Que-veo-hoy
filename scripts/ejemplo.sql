CREATE TABLE estudiantes(
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
	comisionId INT,
	FOREIGN KEY estudiantes(comisionId)	REFERENCES comisiones(id)
)
