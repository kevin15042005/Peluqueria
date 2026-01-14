import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080';

const Asistencia = () => {
  // Estados principales
  const [empleados, setEmpleados] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // Obtener fecha de hoy en formato YYYY-MM-DD
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpleados();
    cargarAsistencias();
  }, []);
  
  // 1. Cargar empleados usando procedimiento almacenado
  const cargarEmpleados = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/empleados`);
      const datos = await respuesta.json();
      
      if (datos.success) {
        setEmpleados(datos.data);
      } else {
        setMensaje('Error al cargar empleados');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };
  
  // 2. Cargar asistencias usando procedimiento almacenado
  const cargarAsistencias = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/asistencia`);
      const datos = await respuesta.json();
      
      if (datos.success) {
        setAsistencias(datos.data);
      } else {
        setMensaje('Error al cargar asistencias');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Error de conexión con el servidor');
    }
  };
  
  // 3. Registrar entrada usando procedimiento almacenado
  const registrarEntrada = async () => {
    if (!empleadoSeleccionado) {
      setMensaje('Por favor selecciona un empleado');
      return;
    }
    
    setCargando(true);
    setMensaje('');
    
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trabajador_id: parseInt(empleadoSeleccionado) })
      });
      
      const datos = await respuesta.json();
      
      if (datos.success) {
        setMensaje('✅ Entrada registrada correctamente');
        setEmpleadoSeleccionado('');
        cargarAsistencias(); // Recargar lista
      } else {
        // Si ya tiene entrada, preguntar si quiere reactivar
        if (datos.code === 'ENTRADA_DUPLICADA') {
          const confirmar = window.confirm(
            'Este empleado ya tiene entrada hoy. ¿Quieres reactivar la entrada?'
          );
          
          if (confirmar) {
            await reactivarEntrada(parseInt(empleadoSeleccionado));
          }
        } else {
          setMensaje(`❌ ${datos.message}`);
        }
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };
  
  // 4. Reactivar entrada usando procedimiento almacenado
  const reactivarEntrada = async (empleadoId) => {
    setCargando(true);
    
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/reactivar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trabajador_id: empleadoId })
      });
      
      const datos = await respuesta.json();
      
      if (datos.success) {
        setMensaje('🔄 Entrada reactivada correctamente');
        cargarAsistencias(); // Recargar lista
      } else {
        setMensaje(`❌ ${datos.message}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };
  
  // 5. Registrar salida usando procedimiento almacenado
  const registrarSalida = async (asistenciaId, nombreEmpleado) => {
    if (!window.confirm(`¿Registrar salida para ${nombreEmpleado}?`)) {
      return;
    }
    
    setCargando(true);
    
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/salida`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencia_id: asistenciaId })
      });
      
      const datos = await respuesta.json();
      
      if (datos.success) {
        setMensaje(`✅ Salida registrada para ${nombreEmpleado}`);
        cargarAsistencias(); // Recargar lista
      } else {
        setMensaje(`❌ ${datos.message}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };
  
  // Filtrar asistencias de hoy
  const hoy = obtenerFechaHoy();
  const asistenciasHoy = asistencias.filter(a => a.FECHA === hoy);
  
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Registro de Asistencia</h1>
      <p>Fecha: {hoy}</p>
      
      {mensaje && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          backgroundColor: mensaje.includes('✅') ? '#d4edda' : 
                         mensaje.includes('🔄') ? '#fff3cd' : '#f8d7da',
          border: `1px solid ${mensaje.includes('✅') ? '#c3e6cb' : 
                             mensaje.includes('🔄') ? '#ffeaa7' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: mensaje.includes('✅') ? '#155724' : 
                 mensaje.includes('🔄') ? '#856404' : '#721c24'
        }}>
          {mensaje}
        </div>
      )}
      
      {/* Sección 1: Registrar Entrada */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2>Registrar Entrada</h2>
        
        <div style={{ margin: '10px 0' }}>
          <label>Seleccionar Empleado:</label>
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
            disabled={cargando}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          >
            <option value="">-- Selecciona un empleado --</option>
            {empleados.map(emp => (
              <option key={emp.ID} value={emp.ID}>
                {emp.NOMBRE} ({emp.CORREO})
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={registrarEntrada}
          disabled={cargando || !empleadoSeleccionado}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: cargando || !empleadoSeleccionado ? 'not-allowed' : 'pointer',
            opacity: cargando || !empleadoSeleccionado ? 0.5 : 1
          }}
        >
          {cargando ? 'Procesando...' : 'Registrar Entrada'}
        </button>
      </div>
      
      {/* Sección 2: Asistencias de Hoy */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Asistencias de Hoy</h2>
          <button
            onClick={() => {
              cargarEmpleados();
              cargarAsistencias();
            }}
            disabled={cargando}
            style={{ padding: '5px 10px' }}
          >
            Actualizar
          </button>
        </div>
        
        {asistenciasHoy.length === 0 ? (
          <p>No hay asistencias registradas hoy</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Empleado</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Entrada</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Salida</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Estado</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {asistenciasHoy.map(asistencia => {
                const puedeSalida = asistencia.ESTADO === 'PRESENTE' && 
                                   (!asistencia.HORA_SALIDA || asistencia.HORA_SALIDA === '00:00:00');
                
                return (
                  <tr key={asistencia.ID}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {asistencia.NOMBRE}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {asistencia.HORA_ENTRADA || '--'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {asistencia.HORA_SALIDA || '--'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        backgroundColor: asistencia.ESTADO === 'PRESENTE' ? '#d4edda' : '#f8d7da',
                        color: asistencia.ESTADO === 'PRESENTE' ? '#155724' : '#721c24'
                      }}>
                        {asistencia.ESTADO}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {puedeSalida ? (
                        <button
                          onClick={() => registrarSalida(asistencia.ID, asistencia.NOMBRE)}
                          disabled={cargando}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: cargando ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Registrar Salida
                        </button>
                      ) : (
                        <span style={{ color: '#6c757d' }}>Completado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Información del sistema */}
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p>Empleados cargados: {empleados.length}</p>
        <p>Asistencias hoy: {asistenciasHoy.length}</p>
        <p>Total asistencias en sistema: {asistencias.length}</p>
      </div>
    </div>
  );
};

export default Asistencia;