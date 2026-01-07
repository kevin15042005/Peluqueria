import { useEffect, useState } from "react";
const Index = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usuarios, setUsuario] = useState([]);

  //PoopUps

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  //Cargar Usuarios

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/usuarios`
      );
      const data = await res.json();
      setUsuario(data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };
  useEffect(() => {
    cargarUsuarios();
  }, []);

  //Registrar Usuarios
  const handleRegistrar = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const nombre = formData.get("nombre");
    const correo = formData.get("correo");
    const password = formData.get("password");
    const pin = formData.get("pin");
    const rolId = formData.get("rol");

    if (!nombre || !correo || !password || !pin || !rolId) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Validación pin
    if (!/^\d{6}$/.test(pin)) {
      alert("El PIN debe ser de 6 dígitos");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/crear_administrador`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, password, pin, rolId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Usuario creado correctamente");
        e.target.reset();
        setModalCrear(false);
        cargarUsuarios();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error al crear", error);
      alert("Error al crear usuario");
    }
  };

  //Actualizar contrasena

  const editarUsuario = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/update_admin`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: usuarioSeleccionado.correo,
            pin: usuarioSeleccionado.pin,
            nueva_password: usuarioSeleccionado.password,
          }),
        }
      );

      setModalEditar(false);
      setUsuarioSeleccionado(null);
      cargarUsuarios();
    } catch (error) {
      console.log("Erro al actualizar", error);
      alert("Error al actualizar contrasena");
    }
  };

  //Eliminar Usuario
  const EliminarUsuario = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/delete_administrador/${
          usuarioSeleccionado.ID
        }`,
        {
          method: "DELETE",
        }
      );
      setModalEliminar(false);
      setUsuarioSeleccionado(null), cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar usuario");
    }
  };
  return (
    <>
      <div>
        {/*Btn Crear*/}
        <button onClick={() => setModalCrear(!mostrarCrear)}>
          {mostrarCrear ? "Cancelar" : "Agregar Usuario"}
        </button>
        {mostrarCrear && (
          <form onSubmit={handleRegistrar}>
            <fieldset>
              <legend>Crear Usuario</legend>
              <input name="nombre" placeholder="Nombre" />
              <input type="email" name="correo" placeholder="Correo" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contrasena"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="pin"
                placeholder="PIN (6 digitos)"
                maxLength={6}
              />
              <select name="rol" id="">
                <option value="">Seleccione rol</option>
                <option value="1">Empleado</option>
                <option value="2">Administrador</option>
              </select>
              <label htmlFor="">
                <input
                  type="checkbox"
                  onChange={() => setShowPassword(!showPassword)}
                />
                Mostrar ContrasenA
              </label>
              <button type="submit">Guardar</button>
            </fieldset>
          </form>
        )}

        {/*Actualizar*/}
        {modalEditar && (
          <div>
            <h3>Editar Usuario</h3>
            <input
              value={usuarioSeleccionado.CORREO}
              onChange={(e) =>
                setUsuarioSeleccionado({
                  ...usuarioSeleccionado,
                  CORREO: e.target.value,
                })
              }
            />
            <input
              type="password"
              onChange={(e) =>
                setUsuarioSeleccionado({
                  ...usuarioSeleccionado,
                  PASSWORD: e.target.value,
                })
              }
              placeholder="Contrasena"
            />
            <input
              onChange={(e) =>
                setUsuarioSeleccionado({
                  ...usuarioSeleccionado,
                  PIN: e.target.value,
                })
              }
              placeholder="PIN"
              maxLength={6}
            />
            <button onClick={editarUsuario} Guardar></button>
            <button onClick={() => setModalEditar(false)}>Cancelar</button>
          </div>
        )}

        {/*Eliminar*/}
        {modalEliminar && (
          <div>
            <p>Eliminar a {usuarioSeleccionado.NOMBRE}</p>
            <button onClick={EliminarUsuario}>Si</button>
            <button onClick={() => setModalEliminar(false)}></button>
          </div>
        )}

        <h3>Usuarios</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <tr key={u.ID}>
                  <td>{u.ID}</td>
                  <td>{u.NOMBRE}</td>
                  <td>{u.CORREO}</td>
                  <td>{u.ROL}</td>
                  <td>
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setModalEditar(true);
                      }}
                    >
                      Editar
                    </button>{" "}
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setModalEliminar(true);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No hay ususarios</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default Index;
