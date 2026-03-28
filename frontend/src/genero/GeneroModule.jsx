import { useEffect, useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { generoApi } from '../shared/services/api';

const initialState = {
  nombre: '',
  descripcion: '',
  estado: 'Activo'
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

export default function GeneroModule({ generos = [], onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const typedName = normalizeText(form.nombre);
    if (!typedName) {
      setForm((prev) => ({ ...prev, descripcion: '', estado: 'Activo' }));
      return;
    }

    const found = generos.find((item) => normalizeText(item.nombre) === typedName);
    if (!found) {
      setForm((prev) => ({ ...prev, descripcion: '', estado: 'Activo' }));
      return;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        nombre: found.nombre || '',
        descripcion: found.descripcion || '',
        estado: found.estado || 'Activo'
      };

      if (
        prev.nombre === next.nombre
        && prev.descripcion === next.descripcion
        && prev.estado === next.estado
      ) {
        return prev;
      }

      return next;
    });

    setMessage('Género encontrado: formulario completado automáticamente.');
  }, [form.nombre, generos]);

  const clearMessage = () => setMessage('');

  const validateRequiredFields = () => {
    if (!form.nombre.trim() || !form.descripcion.trim()) {
      setMessage('Completa los datos obligatorios para continuar.');
      return false;
    }
    return true;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!validateRequiredFields()) return;
    try {
      await generoApi.create(form);
      setMessage('Género creado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async () => {
    clearMessage();
    if (!validateRequiredFields()) return;
    try {
      await generoApi.updateByNombre(form.nombre, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        estado: form.estado
      });
      setMessage('Género actualizado correctamente');
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async () => {
    clearMessage();
    try {
      await generoApi.deleteByNombre(form.nombre);
      setMessage('Género eliminado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ModuleCard title="Género">
      <form className="grid-3" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => updateField('nombre', e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => updateField('descripcion', e.target.value)}
          required
        />
        <select value={form.estado} onChange={(e) => updateField('estado', e.target.value)}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <div className="actions">
          <button className="btn primary" type="submit">Crear</button>
          <button className="btn warning" type="button" onClick={handleUpdate}>Actualizar</button>
          <button className="btn danger" type="button" onClick={handleDelete}>Eliminar</button>
        </div>
      </form>
      {message && <p className="module-message">{message}</p>}
    </ModuleCard>
  );
}
