import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usuarios, setUsuario] = useState([]);


  const navigate = useNavigate()
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
        {mostrarCrear && (
          <div className="fixed  inset-0 flex items-center justify-center ">
            <div className="bg-amber-100  rounded-lg shadow-md p-6 w-full max-w-sm">
              <form onSubmit={handleRegistrar}>
                <div className=" text-end">
                  {" "}
                  <button onClick={() => setModalCrear(false)}>
                    <X size={32} />
                  </button>
                </div>

                <fieldset className="">
                  <legend className="text-center">Crear Usuario</legend>
                  <input
                    name="nombre"
                    placeholder="Nombre"
                    className=" text-center w-full"
                  />
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    className=" text-center w-full"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contrasena"
                    className=" text-center w-full"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="pin"
                    placeholder="PIN (6 digitos)"
                    maxLength={6}
                    className=" text-center w-full"
                  />
                  <select
                    name="rol"
                    id=""
                    className="flex justify-center text-center w-full"
                  >
                    <option value="">Seleccione rol</option>
                    <option value="1">Empleado</option>
                    <option value="2">Administrador</option>
                  </select>
                  <div className="flex justify-between my-4">
                    <label htmlFor="">
                      <input
                        type="checkbox"
                        onChange={() => setShowPassword(!showPassword)}
                      />
                      Mostrar Contrasena
                    </label>
                    <button
                      className="bg-green-300 p-2 rounded-2xl"
                      type="submit"
                    >
                      Guardar
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        )}

        {/*Actualizar*/}
        {modalEditar && (
          <div className="fixed  inset-0 flex items-center justify-center ">
            <div className="bg-amber-100  rounded-lg shadow-md p-6 w-full max-w-sm">
              <div className="text-end">
                {" "}
                <button onClick={() => setModalEditar(false)}>
                  {" "}
                  <X size={22} />
                </button>
              </div>{" "}
              <h3 className="text-center">Editar Usuario</h3>{" "}
              <input
                className="text-center w-full "
                value={usuarioSeleccionado.CORREO}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    CORREO: e.target.value,
                  })
                }
              />
              <input
                className="text-center w-full "
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
                className="text-center w-full "
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    PIN: e.target.value,
                  })
                }
                placeholder="PIN"
                maxLength={6}
              />
              <button
                className="bg-gray-950"
                onClick={editarUsuario}
                Guardar
              ></button>
            </div>
          </div>
        )}

        {/*Eliminar*/}
        {modalEliminar && (
          <div className="fixed  inset-0 flex items-center justify-center ">
            <div className="flex justify-between bg-amber-100  rounded-lg shadow-md p-6 w-full max-w-sm">
              <label className="flex gap-2">
                Eliminar a{" "}
                <p className="underline"> {usuarioSeleccionado.NOMBRE}</p>
              </label>
              <button className="bg-green-300 px-4 rounded-2xl" onClick={EliminarUsuario}>Si</button>
              <button  className="bg-red-300 px-4 rounded-2xl" onClick={() => setModalEliminar(false)}>No</button>
            </div>
          </div>
        )}
        <div className="flex flex-end justify-between mb-4">
          <h3>Usuarios</h3>

          {/*Btn Crear*/}
          <button
            onClick={() => setModalCrear(!mostrarCrear)}
            className="bg-green-400 p-2 rounded-2xl"
          >
            {mostrarCrear ? "Cancelar" : "Agregar Usuario"}
          </button>
        </div>

        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="">
              <th className="border border-gray-400 px-4 py-2">ID</th>
              <th className="border border-gray-400 px-4 py-2">Nombre</th>
              <th className="border border-gray-400 px-4 py-2">Correo</th>
              <th className="border border-gray-400 px-4 py-2">Rol</th>
              <th className="border border-gray-400 px-4 py-2">Acciones </th>
            </tr>
          </thead>
          <tbody className="">
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <tr key={u.ID}>
                  <td className="border border-gray-400 px-4 py-2">{u.ID}</td>
                  <td className="border border-gray-400 px-4 py-2">
                    {u.NOMBRE}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {u.CORREO}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">{u.ROL}</td>
                  <td className="border border-gray-400 px-4 py-2">
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setModalEditar(true);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Editar
                    </button>{" "}
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setModalEliminar(true);
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded"
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
