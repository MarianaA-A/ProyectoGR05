import { useEffect, useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { mediaApi } from '../shared/services/api';

const initialState = {
  serial: '',
  titulo: '',
  sinopsis: '',
  url: '',
  imagenPortada: '',
  anioEstreno: '',
  genero: '',
  director: '',
  productora: '',
  tipo: ''
};

export default function MediaModule({
  generos = [],
  directores = [],
  productoras = [],
  tipos = [],
  onDataChange
}) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const generoValido = generos.some((g) => g._id === form.genero);
    const directorValido = directores.some((d) => d._id === form.director);
    const productoraValida = productoras.some((p) => p._id === form.productora);
    const tipoValido = tipos.some((t) => t._id === form.tipo);

    if (!generoValido && form.genero) setForm((prev) => ({ ...prev, genero: '' }));
    if (!directorValido && form.director) setForm((prev) => ({ ...prev, director: '' }));
    if (!productoraValida && form.productora) setForm((prev) => ({ ...prev, productora: '' }));
    if (!tipoValido && form.tipo) setForm((prev) => ({ ...prev, tipo: '' }));
  }, [generos, directores, productoras, tipos]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearMessage = () => setMessage('');

  const buildPayload = () => ({
    serial: form.serial.trim(),
    titulo: form.titulo.trim(),
    sinopsis: form.sinopsis.trim(),
    url: form.url.trim(),
    imagenPortada: form.imagenPortada.trim(),
    anioEstreno: Number(form.anioEstreno),
    genero: form.genero,
    director: form.director,
    productora: form.productora,
    tipo: form.tipo
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      await mediaApi.create(buildPayload());
      setMessage('Media creada correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async () => {
    clearMessage();
    try {
      await mediaApi.updateBySerial(form.serial, buildPayload());
      setMessage('Media actualizada correctamente');
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async () => {
    clearMessage();
    try {
      await mediaApi.deleteBySerial(form.serial);
      setMessage('Media eliminada correctamente');
      setForm(initialState);
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const generosActivos = generos.filter((g) => g.estado === 'Activo');
  const directoresActivos = directores.filter((d) => d.estado === 'Activo');
  const productorasActivas = productoras.filter((p) => p.estado === 'Activo');

  return (
    <ModuleCard title="Media (Películas y Series)">
      <form className="grid-3" onSubmit={handleCreate}>
        <input type="text" placeholder="Serial" value={form.serial} onChange={(e) => updateField('serial', e.target.value)} required />
        <input type="text" placeholder="Título" value={form.titulo} onChange={(e) => updateField('titulo', e.target.value)} required />
        <input type="text" placeholder="Sinopsis" value={form.sinopsis} onChange={(e) => updateField('sinopsis', e.target.value)} />
        <input type="url" placeholder="URL" value={form.url} onChange={(e) => updateField('url', e.target.value)} required />
        <input type="url" placeholder="URL portada" value={form.imagenPortada} onChange={(e) => updateField('imagenPortada', e.target.value)} />
        <input type="number" placeholder="Año estreno" value={form.anioEstreno} onChange={(e) => updateField('anioEstreno', e.target.value)} required />
        <select value={form.genero} onChange={(e) => updateField('genero', e.target.value)} required>
          <option value="">Seleccione género</option>
          {generosActivos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
        </select>
        <select value={form.director} onChange={(e) => updateField('director', e.target.value)} required>
          <option value="">Seleccione director</option>
          {directoresActivos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombres}</option>
          ))}
        </select>
        <select value={form.productora} onChange={(e) => updateField('productora', e.target.value)} required>
          <option value="">Seleccione productora</option>
          {productorasActivas.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
        </select>
        <select value={form.tipo} onChange={(e) => updateField('tipo', e.target.value)} required>
          <option value="">Seleccione tipo</option>
          {tipos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
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
