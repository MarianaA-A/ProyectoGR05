import { useEffect, useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { tipoApi } from '../shared/services/api';

const initialState = {
  nombre: '',
  descripcion: ''
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

export default function TipoModule({ tipos = [], onDataChange }) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const typedName = normalizeText(form.nombre);
    if (!typedName) {
      setForm((prev) => ({ ...prev, descripcion: '' }));
      return;
    }

    const found = tipos.find((item) => normalizeText(item.nombre) === typedName);
    if (!found) {
      setForm((prev) => ({ ...prev, descripcion: '' }));
      return;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        nombre: found.nombre || '',
        descripcion: found.descripcion || ''
      };

      if (prev.nombre === next.nombre && prev.descripcion === next.descripcion) {
        return prev;
      }

      return next;
    });

    setMessage('Tipo encontrado: formulario completado automáticamente.');
  }, [form.nombre, tipos]);

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
    if (!validateRequiredFields()) return;
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
          required
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
