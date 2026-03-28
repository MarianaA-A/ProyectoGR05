import { useEffect, useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { productoraApi } from '../shared/services/api';

const initialState = {
  nombre: '',
  slogan: '',
  descripcion: '',
  estado: 'Activo'
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

export default function ProductoraModule({ productoras = [], onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const typedName = normalizeText(form.nombre);
    if (!typedName) {
      setForm((prev) => ({ ...prev, slogan: '', descripcion: '', estado: 'Activo' }));
      return;
    }

    const found = productoras.find((item) => normalizeText(item.nombre) === typedName);
    if (!found) {
      setForm((prev) => ({ ...prev, slogan: '', descripcion: '', estado: 'Activo' }));
      return;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        nombre: found.nombre || '',
        slogan: found.slogan || '',
        descripcion: found.descripcion || '',
        estado: found.estado || 'Activo'
      };

      if (
        prev.nombre === next.nombre
        && prev.slogan === next.slogan
        && prev.descripcion === next.descripcion
        && prev.estado === next.estado
      ) {
        return prev;
      }

      return next;
    });

    setMessage('Productora encontrada: formulario completado automáticamente.');
  }, [form.nombre, productoras]);

  const clearMessage = () => setMessage('');

  const validateRequiredFields = () => {
    if (!form.nombre.trim() || !form.slogan.trim() || !form.descripcion.trim()) {
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
      await productoraApi.create(form);
      setMessage('Productora creada correctamente');
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
      await productoraApi.updateByNombre(form.nombre, {
        slogan: form.slogan,
        descripcion: form.descripcion,
        estado: form.estado
      });
      setMessage('Productora actualizada correctamente');
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async () => {
    clearMessage();
    try {
      await productoraApi.deleteByNombre(form.nombre);
      setMessage('Productora eliminada correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ModuleCard title="Productora">
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
          placeholder="Eslogan"
          value={form.slogan}
          onChange={(e) => updateField('slogan', e.target.value)}
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
