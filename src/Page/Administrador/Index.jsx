import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { EyeClosed, Eye } from "lucide-react";
export default function UsuariosAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalAsignarServicios, setModalAsignarServicios] = useState(false);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Cargar usuarios, roles y servicios
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API}/administrador/usuarios`);
      const data = await res.json();

      if (data && Array.isArray(data)) {
        setUsuarios(data);
      } else {
        console.error("Formato de usuarios incorrecto:", data);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al cargar usuarios", error);
      setUsuarios([]);
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await fetch(`${API}/administrador/roles`);
      const data = await res.json();

      if (data && Array.isArray(data)) {
        setRoles(data);
      } else {
        console.error("Formato de roles incorrecto:", data);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error al cargar roles", error);
      setRoles([]);
    }
  };

  // Cargar todos los subservicios disponibles - CORREGIDO
  const cargarServiciosDisponibles = async () => {
    try {
      console.log(
        "🔍 Cargando servicios desde:",
        `${API}/subservicio/obtener_subservicios`,
      );
      const res = await fetch(`${API}/subservicio/obtener_subservicios`);
      const data = await res.json();

      console.log("📦 Respuesta completa:", data);

      if (data.success && data.data && Array.isArray(data.data)) {
        console.log("✅ Servicios cargados:", data.data.length);
        console.log("📊 Estructura del primer servicio:", data.data[0]);

        // Verificar la estructura real de los datos
        data.data.forEach((serv, idx) => {
          console.log(`Servicio ${idx}:`, serv);
        });

        setServiciosDisponibles(data.data);
        setErrorCarga("");
      } else {
        console.error("⚠️ Error en respuesta o datos vacíos:", data);
        setServiciosDisponibles([]);
        setErrorCarga(data.message || "No hay servicios disponibles");
      }
    } catch (error) {
      console.error("❌ Error al cargar servicios:", error);
      setServiciosDisponibles([]);
      setErrorCarga("Error de conexión al cargar servicios");
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
    cargarServiciosDisponibles();
  }, []);

  // Cargar servicios asignados al usuario cuando se abre el modal
  useEffect(() => {
    const cargarServiciosAsignados = async () => {
      if (modalAsignarServicios && usuarioSeleccionado) {
        setCargandoServicios(true);
        try {
          console.log(
            "🔍 Cargando servicios asignados para usuario ID:",
            usuarioSeleccionado.ID,
          );
          const res = await fetch(
            `${API}/administrador/servicios_empleado/${usuarioSeleccionado.ID}`,
          );
          const data = await res.json();

          console.log("📦 Respuesta servicios asignados:", data);

          if (data.success && data.servicios && Array.isArray(data.servicios)) {
            // Usar el ID correcto (SUBSERVICIO_ID o ID)
            const idsAsignados = data.servicios
              .map((serv) => {
                const id = serv.SUBSERVICIO_ID || serv.ID || serv.id;
                return id ? id.toString() : "";
              })
              .filter((id) => id !== "");

            console.log("✅ IDs asignados encontrados:", idsAsignados);
            setServiciosSeleccionados(idsAsignados);
          } else {
            console.log(
              "ℹ️ No hay servicios asignados aún o formato incorrecto",
            );
            setServiciosSeleccionados([]);
          }
        } catch (error) {
          console.error("❌ Error al cargar servicios asignados:", error);
          setServiciosSeleccionados([]);
        } finally {
          setCargandoServicios(false);
        }
      }
    };

    cargarServiciosAsignados();
  }, [modalAsignarServicios, usuarioSeleccionado]);

  // Registrar Usuario
  const handleRegistrar = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const nombre = formData.get("nombre");
    const correo = formData.get("correo");
    const password = formData.get("password");
    const pin = formData.get("pin");
    const rolId = formData.get("rol");

    if (!nombre || !correo || !password || !pin || !rolId) {
      alert("Los campos marcados con * son obligatorios");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      alert("El PIN debe ser de 6 dígitos");
      return;
    }

    try {
      const res = await fetch(`${API}/administrador/crear_administrador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          password,
          pin,
          rolId: parseInt(rolId),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Usuario creado correctamente");
        e.target.reset();
        setModalCrear(false);
        cargarUsuarios();
      } else {
        alert(data.message || "❌ Error al crear usuario");
      }
    } catch (error) {
      console.error("❌ Error al crear", error);
      alert("❌ Error al crear usuario");
    }
  };

  // Actualizar contraseña
  const editarUsuario = async () => {
    if (!usuarioSeleccionado) return;

    if (!usuarioSeleccionado.PIN || usuarioSeleccionado.PIN.length !== 6) {
      alert("El PIN debe tener 6 dígitos");
      return;
    }

    if (!usuarioSeleccionado.PASSWORD) {
      alert("La contraseña no puede estar vacía");
      return;
    }

    try {
      const res = await fetch(`${API}/administrador/update_admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: usuarioSeleccionado.CORREO,
          pin: usuarioSeleccionado.PIN,
          nueva_password: usuarioSeleccionado.PASSWORD,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Contraseña actualizada correctamente");
        setModalEditar(false);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      } else {
        alert(data.message || "❌ Error al actualizar");
      }
    } catch (error) {
      console.error("❌ Error al actualizar", error);
      alert("❌ Error al actualizar contraseña");
    }
  };

  // Eliminar Usuario
  const eliminarUsuario = async () => {
    if (!usuarioSeleccionado) return;

    try {
      const res = await fetch(
        `${API}/administrador/delete_administrador/${usuarioSeleccionado.ID}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Usuario eliminado correctamente");
        setModalEliminar(false);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      } else {
        alert(data.message || "❌ Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error al eliminar usuario");
    }
  };

  // Asignar servicios a empleado - CORREGIDO
  const asignarServiciosEmpleado = async () => {
    if (!usuarioSeleccionado) return;

    if (serviciosSeleccionados.length === 0) {
      alert("⚠️ Debe seleccionar al menos un servicio");
      return;
    }

    // Convertir a números y enviar como array
    const serviciosIds = serviciosSeleccionados
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (serviciosIds.length === 0) {
      alert("⚠️ IDs de servicios inválidos");
      return;
    }

    console.log("📤 Enviando datos al backend:", {
      trabajadorId: usuarioSeleccionado.ID,
      serviciosIds: serviciosIds,
    });

    try {
      const res = await fetch(
        `${API}/administrador/asignar_servicios_empleado`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trabajadorId: parseInt(usuarioSeleccionado.ID),
            serviciosIds: serviciosIds,
          }),
        },
      );

      const data = await res.json();
      console.log("📦 Respuesta del backend:", data);

      if (!res.ok) {
        throw new Error(data.message || `Error HTTP ${res.status}`);
      }

      if (data.success) {
        alert("✅ Servicios asignados correctamente");
        setModalAsignarServicios(false);
        setServiciosSeleccionados([]);
        setUsuarioSeleccionado(null);
        cargarUsuarios();
      } else {
        alert(data.message || "❌ Error al asignar servicios");
      }
    } catch (error) {
      console.error("❌ Error detallado:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Abrir modal de asignar servicios
  const abrirModalAsignarServicios = (usuario) => {
    if (usuario.ROL !== "empleado") {
      alert("⚠️ Solo se pueden asignar servicios a empleados");
      return;
    }

    setUsuarioSeleccionado(usuario);
    setModalAsignarServicios(true);
  };

  // Función helper para obtener el ID de un servicio
  const obtenerIdServicio = (servicio) => {
    return servicio.SUBSERVICIO_ID || servicio.ID || servicio.id || "";
  };

  // Función helper para obtener el nombre de un servicio
  const obtenerNombreServicio = (servicio) => {
    return servicio.NOMBRE || servicio.nombre || "Sin nombre";
  };

  // Función helper para obtener la categoría de un servicio
  const obtenerCategoriaServicio = (servicio) => {
    return (
      servicio.SERVICIO_NOMBRE ||
      servicio.SERVICIO ||
      servicio.categoria ||
      "General"
    );
  };

  return (
      <div className="py-12 md:p-8 max-w-6xl w-full ">
      {/* Modal Crear */}
      {mostrarCrear && (
        <div className="fixed inset-0 bg-current/40 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Crear Nuevo Usuario
              </h3>
              <button
                onClick={() => setModalCrear(false)}
                className="text-gray-200 hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRegistrar}>
              <div className="space-y-4">
                <input
                  name="nombre"
                  placeholder="Nombre completo "
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico "
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña "
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />
                <input
                  type={showPassword ? "number" : "password"}
                  name="pin"
                  placeholder="PIN (6 dígitos) "
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />

                <select
                  name="rol"
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                >
                  <option className="bg-black" value="">
                    Seleccione rol *
                  </option>
                  {roles.map((rol) => (
                    <option className="bg-black" key={rol.ID} value={rol.ID}>
                      {rol.NOMBRE}
                    </option>
                  ))}
                </select>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    {showPassword ? <Eye /> : <EyeClosed />}
                    <span className="ml-2 text-amber-300">
                      Mostrar contraseña
                    </span>
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalCrear(false)}
                    className="px-4 py-2 border rounded-lg text-amber-300 border-amber-300 hover:bg-white/30"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border text-amber-300 border-amber-300   rounded-lg hover:bg-white/30"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && usuarioSeleccionado && (
        <div className="fixed inset-0  bg-current/30 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between  items-center mb-4">
              <h3 className="text-xl font-bold text-amber-300">
                Editar Usuario
              </h3>
              <button
                onClick={() => setModalEditar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Correo
                </label>
                <input
                  value={usuarioSeleccionado.CORREO || ""}
                  onChange={(e) =>
                    setUsuarioSeleccionado({
                      ...usuarioSeleccionado,
                      CORREO: e.target.value,
                    })
                  }
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={usuarioSeleccionado.PASSWORD || ""}
                  onChange={(e) =>
                    setUsuarioSeleccionado({
                      ...usuarioSeleccionado,
                      PASSWORD: e.target.value,
                    })
                  }
                  placeholder="Nueva contraseña"
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  PIN *
                </label>
                <input
                  value={usuarioSeleccionado.PIN || ""}
                  onChange={(e) =>
                    setUsuarioSeleccionado({
                      ...usuarioSeleccionado,
                      PIN: e.target.value,
                    })
                  }
                  type={showPassword?"text":"password"}
                  placeholder="6 dígitos"
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full p-3 border text-amber-300 border-amber-300 rounded-lg "
                  required
                />
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center text-orange-500 hover:text-orange-400 transition-colors"
                >
                  {showPassword?<Eye/>:<EyeClosed/>}
                  <span
                    className="text-amber-300 border-amber-300"
                    htmlFor="showPassword"
                  >
                    Mostrar contraseña
                  </span>
                </button>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2 border rounded-lg text-amber-300 border-amber-300 hover:bg-white/30"
                >
                  Cancelar
                </button>
                <button
                  onClick={editarUsuario}
                  className="px-4 py-2 border rounded-lg text-amber-300 border-amber-300 hover:bg-white/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-current/30 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-amber-300 mb-4">Confirmar Eliminación</h3>
            <p className="mb-6  text-amber-300">
              ¿Estás seguro de eliminar al usuario 
              <span className="font-bold">{usuarioSeleccionado.NOMBRE}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalEliminar(false)}
                  className="px-4 py-2 border rounded-lg text-amber-300 border-amber-300 hover:bg-white/30"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarUsuario}
                  className="px-4 py-2 border rounded-lg text-amber-300 border-amber-300 hover:bg-white/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Servicios */}
      {modalAsignarServicios && usuarioSeleccionado && (
        <div className="fixed inset-0  pt-5  bg-current/30 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg shadow-xl p-6 w-94 max-w-lg max-h-[90vh]  overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-300">
                Asignar Servicios a {usuarioSeleccionado.NOMBRE}
              </h3>
              <button
                onClick={() => {
                  setModalAsignarServicios(false);
                  setServiciosSeleccionados([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 flex-1 overflow-hidden">
              <p className="text-sm text-amber-300 mb-4">
                Seleccione los subservicios que puede realizar este empleado:
              </p>

              {cargandoServicios ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-amber-500">Cargando servicios...</p>
                </div>
              ) : serviciosDisponibles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p> No hay servicios disponibles para asignar</p>
                  {errorCarga && <p className="text-sm mt-2">{errorCarga}</p>}
                  <button
                    onClick={cargarServiciosDisponibles}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto p-2 border rounded-lg">
                    {serviciosDisponibles.map((servicio, index) => {
                      const servicioId = obtenerIdServicio(servicio);
                      const servicioNombre = obtenerNombreServicio(servicio);
                      const categoria = obtenerCategoriaServicio(servicio);

                      if (!servicioId) {
                        console.warn("Servicio sin ID:", servicio);
                        return null;
                      }

                      return (
                        <div
                          key={`servicio-${servicioId}-${index}`}
                          className="flex items-start text-amber-300 p-3 hover:bg-white/30 rounded border-b last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            id={`servicio-${servicioId}`}
                            checked={serviciosSeleccionados.includes(
                              servicioId.toString(),
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiciosSeleccionados([
                                  ...serviciosSeleccionados,
                                  servicioId.toString(),
                                ]);
                              } else {
                                setServiciosSeleccionados(
                                  serviciosSeleccionados.filter(
                                    (id) => id !== servicioId.toString(),
                                  ),
                                );
                              }
                            }}
                            className="mr-3 mt-1 h-5 w-5 text-amber-300"
                          />
                          <label
                            htmlFor={`servicio-${servicioId}`}
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-medium">{servicioNombre}</div>
                            <div className="text-sm text-amber-300 mt-1">
                              <span className="font-semibold ">Categoría:</span> 
                              {categoria}
                              {servicio.PRECIO !== undefined && (
                                <span className="ml-3 font-semibold text-green-600">
                                  $
                                  {parseFloat(servicio.PRECIO).toLocaleString()}
                                </span>
                              )}
                            </div>
                            {servicio.DESCRIPCION && (
                              <div className="text-xs text-amber-200 mt-1">
                                {servicio.DESCRIPCION}
                              </div>
                            )}
                            {servicio.DURACION_MINUTOS && (
                              <div className="text-xs text-amber-300  mt-1">
                                 Duración: {servicio.DURACION_MINUTOS} minutos
                              </div>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                 
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setModalAsignarServicios(false);
                  setServiciosSeleccionados([]);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={asignarServiciosEmpleado}
                disabled={
                  serviciosSeleccionados.length === 0 || cargandoServicios
                }
                className={`px-4 py-2 rounded-lg font-medium ${
                  serviciosSeleccionados.length === 0 || cargandoServicios
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                {cargandoServicios
                  ? "Cargando..."
                  : `Asignar ${serviciosSeleccionados.length} servicio(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}

      <div className=" py-10  my-10 grid grid-cols-1  overflow-x-auto bg-amber-200 border-2 border-amber-500 rounded-lg shadow">
        <div className="flex flex-col  sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4 md:px-6">
           
          <h2 className="text-2xl font-bold"> Gestión de Usuarios</h2>
          <button
            onClick={() => setModalCrear(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Agregar Usuario
          </button>
        </div>
        <div className="">
          <table className="w-full  divide-y divide-x   ">
             
            <thead className="hidden md:table-header-group ">
              <tr className="  bg-amber-200 border-y-2 border-amber-500 max-w-full">
                <th className="px-6 py-3 text-left text-xs  text-black font-extrabold uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs  text-black font-extrabold  uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs text-black font-extrabold  uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs text-black font-extrabold  uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs text-black font-extrabold  uppercase tracking-wider">
                  Servicios Asignados
                </th>
                <th className="px-6 py-3 text-left text-xs text-black font-extrabold  uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs text-black font-extrabold  uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className=" bg-amber divide-y divide-gray-200 ">
               
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.ID}
                    className="hover:bg-yellow-400 max-w-6xl w-full md:table-row grid grid-cols-2   border-b"
                  >
                     
                    <td className="px-6 py-4 whitespace-nowrap md:table-cell block">
                      <span className="md:hidden font-bold mr-2">ID:</span>
                      {usuario.ID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap md:table-cell block">
                      <span className="md:hidden font-bold mr-2">Nombre:</span>
                      {usuario.NOMBRE}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap md:table-cell block ">
                      <span className="md:hidden font-bold pr-2">Correo:</span>
                      <span className="text-[14px]">{usuario.CORREO}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap md:table-cell block">
                      <span className="md:hidden font-bold mr-2">Rol:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.ROL === "administrador"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {usuario.ROL}
                      </span>
                    </td>
                    <td className="px-6 py-4 md:table-cell block">
                      <span className="md:hidden font-bold mr-2">
                        Servicios:
                      </span>
                      <div className="max-w-xs">
                        {usuario.SERVICIOS_ASIGNADOS &&
                        usuario.SERVICIOS_ASIGNADOS !== "NULL" ? (
                          <div className="text-sm text-gray-700">
                            {usuario.SERVICIOS_ASIGNADOS.split(", ").map(
                              (servicio, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1 text-xs"
                                >
                                  {servicio}
                                </span>
                              ),
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Sin servicios
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap md:table-cell block">
                      <span className="md:hidden font-bold mr-2">Estado:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          usuario.ESTADO === "activo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.ESTADO}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex- gap-2">
                        <span className="md:hidden font-bold mr-2">
                          Acciones:
                        </span>
                        <button
                          onClick={() => {
                            setUsuarioSeleccionado(usuario);
                            setModalEditar(true);
                          }}
                          className="flex px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Editar
                        </button>

                        {usuario.ROL === "empleado" && (
                          <button
                            onClick={() => abrirModalAsignarServicios(usuario)}
                            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                          >
                            Servicios
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setUsuarioSeleccionado(usuario);
                            setModalEliminar(true);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
