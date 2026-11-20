/* Datos mínimos para arrancar. Ejecutar DESPUÉS del script de tablas y procedimientos.
   Los procedimientos asumen ROL 1 = empleado y ROL 2 = administrador. */
USE PELUQUERIA;

INSERT IGNORE INTO ROL (ID, NOMBRE) VALUES
  (1, 'empleado'),
  (2, 'administrador');

/* Administrador inicial: entra con admin@peluqueria.com / admin123
   CAMBIA la contraseña después del primer ingreso (CRUD > actualizar, con el PIN). */
INSERT IGNORE INTO USUARIO (NOMBRE, CORREO, PASSWORD_LOGIN, PIN, ROL_ID)
VALUES ('Administrador', 'admin@peluqueria.com', 'admin123', '123456', 2);
