import { useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { tipoApi } from '../shared/services/api';

const initialState = {
  nombre: '',
  descripcion: ''
};

export default function TipoModule({ onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearMessage = () => setMessage('');

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      await tipoApi.create(form);
      setMessage('Tipo creado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async () => {
    clearMessage();
    try {
      await tipoApi.updateByNombre(form.nombre, { descripcion: form.descripcion });
      setMessage('Tipo actualizado correctamente');
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async () => {
    clearMessage();
    try {
      await tipoApi.deleteByNombre(form.nombre);
      setMessage('Tipo eliminado correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ModuleCard title="Tipo">
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
        />
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
