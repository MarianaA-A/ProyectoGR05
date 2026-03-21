import { useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { directorApi } from '../shared/services/api';

const initialState = {
  nombres: '',
  estado: 'Activo'
};

export default function DirectorModule({ onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearMessage = () => setMessage('');

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      await directorApi.create(form);
      setMessage('Director creado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async () => {
    clearMessage();
    try {
      await directorApi.updateByNombre(form.nombres, { estado: form.estado });
      setMessage('Director actualizado correctamente');
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async () => {
    clearMessage();
    try {
      await directorApi.deleteByNombre(form.nombres);
      setMessage('Director eliminado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ModuleCard title="Director">
      <form className="grid-3" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nombres"
          value={form.nombres}
          onChange={(e) => updateField('nombres', e.target.value)}
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
