import { useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { productoraApi } from '../shared/services/api';

const initialState = {
  nombre: '',
  slogan: '',
  descripcion: '',
  estado: 'Activo'
};

export default function ProductoraModule({ onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearMessage = () => setMessage('');

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
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
          placeholder="Slogan"
          value={form.slogan}
          onChange={(e) => updateField('slogan', e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => updateField('descripcion', e.target.value)}
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
