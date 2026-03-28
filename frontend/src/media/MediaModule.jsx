import { useEffect, useState } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { mediaApi } from '../shared/services/api';

const getNextSerial = (medias = []) => {
  const numericSerials = medias
    .map((item) => String(item?.serial || '').trim())
    .filter((serial) => /^\d+$/.test(serial))
    .map((serial) => Number(serial));

  const nextValue = numericSerials.length ? Math.max(...numericSerials) + 1 : 0;
  return String(nextValue).padStart(4, '0');
};

const createInitialState = () => ({
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
});

export default function MediaModule({
  generos = [],
  directores = [],
  productoras = [],
  tipos = [],
  medias = [],
  onDataChange
}) {
  const [form, setForm] = useState(createInitialState);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

  const getRelationId = (value) => {
    if (!value) return '';
    if (typeof value === 'object') return value._id?.toString() || '';
    return value.toString();
  };

  useEffect(() => {
    const typedSerial = form.serial.trim();
    if (!typedSerial) {
      setForm((prev) => ({
        ...prev,
        titulo: '',
        sinopsis: '',
        url: '',
        imagenPortada: '',
        anioEstreno: '',
        genero: '',
        director: '',
        productora: '',
        tipo: ''
      }));
      return;
    }

    const mediaFound = medias.find((item) => String(item.serial || '').trim() === typedSerial);
    if (!mediaFound) {
      setForm((prev) => ({
        ...prev,
        titulo: '',
        sinopsis: '',
        url: '',
        imagenPortada: '',
        anioEstreno: '',
        genero: '',
        director: '',
        productora: '',
        tipo: ''
      }));
      return;
    }

    setForm((prev) => {
      const next = {
        ...prev,
        serial: typedSerial,
        titulo: mediaFound.titulo || '',
        sinopsis: mediaFound.sinopsis || '',
        url: mediaFound.url || '',
        imagenPortada: mediaFound.imagenPortada || '',
        anioEstreno: String(mediaFound.anioEstreno || ''),
        genero: getRelationId(mediaFound.genero),
        director: getRelationId(mediaFound.director),
        productora: getRelationId(mediaFound.productora),
        tipo: getRelationId(mediaFound.tipo)
      };

      if (
        prev.titulo === next.titulo
        && prev.sinopsis === next.sinopsis
        && prev.url === next.url
        && prev.imagenPortada === next.imagenPortada
        && prev.anioEstreno === next.anioEstreno
        && prev.genero === next.genero
        && prev.director === next.director
        && prev.productora === next.productora
        && prev.tipo === next.tipo
      ) {
        return prev;
      }

      return next;
    });

    setFieldErrors((prev) => ({ ...prev, serial: undefined }));
    setMessage('Media encontrada: formulario completado automáticamente.');
  }, [form.serial, medias]);

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isValidImageUrl = (value) => {
    return isValidUrl(value) && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(value);
  };

  const validateForm = () => {
    const errors = {};
    const trimmedUrl = form.url.trim();
    const trimmedImagenPortada = form.imagenPortada.trim();

    if (!form.serial.trim()) errors.serial = 'El serial es obligatorio';
    if (!form.titulo.trim()) errors.titulo = 'El título es obligatorio';
    if (!form.sinopsis.trim()) errors.sinopsis = 'La sinopsis es obligatoria';
    if (!trimmedUrl) errors.url = 'La URL es obligatoria';
    else if (!isValidUrl(trimmedUrl)) errors.url = 'Ingrese una URL válida (http:// o https://)';
    if (trimmedImagenPortada && !isValidImageUrl(trimmedImagenPortada)) {
      errors.imagenPortada = 'Ingrese una URL de imagen válida (.jpg, .png, .webp, .gif, .svg)';
    }
    if (!form.anioEstreno.trim() || Number.isNaN(Number(form.anioEstreno))) {
      errors.anioEstreno = 'El año de estreno debe ser un número válido';
    }
    if (!form.genero) errors.genero = 'Seleccione un género';
    if (!form.director) errors.director = 'Seleccione un director';
    if (!form.productora) errors.productora = 'Seleccione una productora';
    if (!form.tipo) errors.tipo = 'Seleccione un tipo';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const clearMessage = () => {
    setMessage('');
    setFieldErrors({});
  };

  const buildPayload = () => ({
    serial: form.serial.trim(),
    titulo: form.titulo.trim(),
    sinopsis: form.sinopsis.trim(),
    url: form.url.trim(),
    imagenPortada: form.imagenPortada.trim() || form.url.trim(),
    anioEstreno: Number(form.anioEstreno),
    genero: form.genero,
    director: form.director,
    productora: form.productora,
    tipo: form.tipo
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessage();
    if (!validateForm()) {
      setMessage('Corrige los errores en el formulario antes de crear.');
      return;
    }

    try {
      await mediaApi.create(buildPayload());
      setMessage('Media creada correctamente');
      setForm(createInitialState());
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUpdate = async () => {
    clearMessage();
    if (!form.serial.trim()) {
      setFieldErrors({ serial: 'El serial es obligatorio para actualizar' });
      setMessage('Completa el serial antes de actualizar.');
      return;
    }

    if (!validateForm()) {
      setMessage('Corrige los errores en el formulario antes de actualizar.');
      return;
    }

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
    if (!form.serial.trim()) {
      setFieldErrors({ serial: 'El serial es obligatorio para eliminar' });
      setMessage('Completa el serial antes de eliminar.');
      return;
    }

    try {
      await mediaApi.deleteBySerial(form.serial);
      setMessage('Media eliminada correctamente');
      setForm(createInitialState());
      onDataChange?.();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const generosActivos = generos.filter((g) => g.estado === 'Activo');
  const directoresActivos = directores.filter((d) => d.estado === 'Activo');
  const productorasActivas = productoras.filter((p) => p.estado === 'Activo');
  const previewImageUrl = form.imagenPortada.trim() && isValidImageUrl(form.imagenPortada.trim()) ? form.imagenPortada.trim() : null;
  const renderFieldError = (field) => fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>;

  return (
    <ModuleCard title="Media (Películas y Series)">
      <form className="grid-3" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Serial"
          value={form.serial}
          onChange={(e) => updateField('serial', e.target.value)}
          aria-invalid={Boolean(fieldErrors.serial)}
          required
        />
        {renderFieldError('serial')}

        <input
          type="text"
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
          aria-invalid={Boolean(fieldErrors.titulo)}
          required
        />
        {renderFieldError('titulo')}

        <input
          type="text"
          placeholder="Sinopsis"
          value={form.sinopsis}
          onChange={(e) => updateField('sinopsis', e.target.value)}
          aria-invalid={Boolean(fieldErrors.sinopsis)}
          required
        />
        {renderFieldError('sinopsis')}

        <input
          type="url"
          placeholder="https://example.com"
          value={form.url}
          onChange={(e) => updateField('url', e.target.value)}
          aria-invalid={Boolean(fieldErrors.url)}
          required
        />
        {renderFieldError('url')}

        <input
          type="url"
          placeholder="https://example.com/portada.jpg"
          value={form.imagenPortada}
          onChange={(e) => updateField('imagenPortada', e.target.value)}
          aria-invalid={Boolean(fieldErrors.imagenPortada)}
        />
        {renderFieldError('imagenPortada')}
        <p className="field-note">URL opcional de la imagen de portada.</p>

        <input
          type="number"
          placeholder="Año estreno"
          value={form.anioEstreno}
          onChange={(e) => updateField('anioEstreno', e.target.value)}
          aria-invalid={Boolean(fieldErrors.anioEstreno)}
          required
        />
        {renderFieldError('anioEstreno')}

        <select
          value={form.genero}
          onChange={(e) => updateField('genero', e.target.value)}
          aria-invalid={Boolean(fieldErrors.genero)}
          required
        >
          <option value="">Seleccione género</option>
          {generosActivos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
        </select>
        {renderFieldError('genero')}

        <select
          value={form.director}
          onChange={(e) => updateField('director', e.target.value)}
          aria-invalid={Boolean(fieldErrors.director)}
          required
        >
          <option value="">Seleccione director</option>
          {directoresActivos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombres}</option>
          ))}
        </select>
        {renderFieldError('director')}

        <select
          value={form.productora}
          onChange={(e) => updateField('productora', e.target.value)}
          aria-invalid={Boolean(fieldErrors.productora)}
          required
        >
          <option value="">Seleccione productora</option>
          {productorasActivas.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
        </select>
        {renderFieldError('productora')}

        <select
          value={form.tipo}
          onChange={(e) => updateField('tipo', e.target.value)}
          aria-invalid={Boolean(fieldErrors.tipo)}
          required
        >
          <option value="">Seleccione tipo</option>
          {tipos.map((item) => (
            <option key={item._id} value={item._id}>{item.nombre}</option>
          ))}
        </select>
        {renderFieldError('tipo')}

        <div className="actions">
          <button className="btn primary" type="submit">Crear</button>
          <button className="btn warning" type="button" onClick={handleUpdate} disabled={!form.serial.trim()}>
            Actualizar
          </button>
          <button className="btn danger" type="button" onClick={handleDelete} disabled={!form.serial.trim()}>
            Eliminar
          </button>
        </div>
      </form>

      {previewImageUrl && (
        <div className="image-preview">
          <p>Vista previa de portada válida:</p>
          <img src={previewImageUrl} alt="Vista previa de portada" />
        </div>
      )}

      {message && <p className="module-message">{message}</p>}
    </ModuleCard>
  );
}
