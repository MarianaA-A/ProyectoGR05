import { useMemo, useRef, useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80';

const GENRE_COVER_MAP = {
  accion: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',
  aventura: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1000&q=80',
  comedia: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=1000&q=80',
  drama: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1000&q=80',
  terror: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1000&q=80',
  horror: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1000&q=80',
  suspenso: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1000&q=80',
  romance: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
  documental: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1000&q=80',
  animacion: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=80',
  ciencia: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=80',
  fantasia: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1000&q=80',
  crimen: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80'
};

function isLikelyImageUrl(value) {
  return Boolean(value) && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(value);
}

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isActive(value) {
  return normalizeText(value) === 'activo';
}

function getRelationId(value) {
  if (!value) return null;
  if (typeof value === 'object') return value._id?.toString() || null;
  return value.toString();
}

function getGenreFallback(generoName) {
  const normalized = normalizeText(generoName);
  const matchedKey = Object.keys(GENRE_COVER_MAP).find((key) => normalized.includes(key));
  return matchedKey ? GENRE_COVER_MAP[matchedKey] : FALLBACK_IMAGE;
}

function getCoverUrl(media) {
  if (isLikelyImageUrl(media?.url)) return media.url;
  if (isLikelyImageUrl(media?.imagenPortada)) return media.imagenPortada;
  return getGenreFallback(media?.generoName);
}

function getEntityName(value, list) {
  if (!value) return 'No definido';

  if (typeof value === 'object') {
    return value.nombre || value.nombres || 'No definido';
  }

  const found = list.find((item) => item._id === value || item._id === value?.toString());
  return found ? found.nombre || found.nombres || 'No definido' : 'No definido';
}

function normalizeMedia(media, catalogs) {
  return {
    ...media,
    generoName: getEntityName(media.genero, catalogs.generos),
    directorName: getEntityName(media.director, catalogs.directores),
    productoraName: getEntityName(media.productora, catalogs.productoras),
    tipoName: getEntityName(media.tipo, catalogs.tipos)
  };
}

export default function MediaViewerModule({
  medias = [],
  generos = [],
  directores = [],
  productoras = [],
  tipos = []
}) {
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filters, setFilters] = useState({
    genero: '',
    director: '',
    productora: '',
    tipo: ''
  });
  const carouselRef = useRef(null);

  const normalizedMedias = useMemo(
    () => medias.map((media) => normalizeMedia(media, { generos, directores, productoras, tipos })),
    [medias, generos, directores, productoras, tipos]
  );

  const activeCatalogIds = useMemo(() => ({
    generos: new Set(generos.filter((item) => isActive(item.estado)).map((item) => item._id?.toString())),
    directores: new Set(directores.filter((item) => isActive(item.estado)).map((item) => item._id?.toString())),
    productoras: new Set(productoras.filter((item) => isActive(item.estado)).map((item) => item._id?.toString()))
  }), [generos, directores, productoras]);

  const activeCatalogValues = useMemo(() => {
    const sorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

    return {
      generos: sorted(generos.filter((item) => isActive(item.estado)).map((item) => item.nombre)),
      directores: sorted(directores.filter((item) => isActive(item.estado)).map((item) => item.nombres)),
      productoras: sorted(productoras.filter((item) => isActive(item.estado)).map((item) => item.nombre)),
      tipos: sorted(tipos.map((item) => item.nombre))
    };
  }, [generos, directores, productoras, tipos]);

  const activeMedias = useMemo(
    () => normalizedMedias.filter((media) => {
      const generoId = getRelationId(media.genero);
      const directorId = getRelationId(media.director);
      const productoraId = getRelationId(media.productora);

      return activeCatalogIds.generos.has(generoId)
        && activeCatalogIds.directores.has(directorId)
        && activeCatalogIds.productoras.has(productoraId);
    }),
    [normalizedMedias, activeCatalogIds]
  );

  const filteredMedias = useMemo(() => {
    const term = search.trim().toLowerCase();

    return activeMedias.filter((media) => {
      const matchesSearch = !term
        || media.titulo?.toLowerCase().includes(term)
        || media.serial?.toLowerCase().includes(term)
        || media.sinopsis?.toLowerCase().includes(term);

      const matchesGenero = !filters.genero || media.generoName === filters.genero;
      const matchesDirector = !filters.director || media.directorName === filters.director;
      const matchesProductora = !filters.productora || media.productoraName === filters.productora;
      const matchesTipo = !filters.tipo || media.tipoName === filters.tipo;

      return matchesSearch && matchesGenero && matchesDirector && matchesProductora && matchesTipo;
    });
  }, [activeMedias, search, filters]);

  const uniqueValues = useMemo(() => activeCatalogValues, [activeCatalogValues]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const amount = Math.max(280, carouselRef.current.clientWidth * 0.8);
    carouselRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="viewer-layout" aria-label="Vista de usuario">
      <div className="viewer-toolbar card">
        <h2>Explorar Películas y Series</h2>
        <p className="viewer-subtitle">Filtra por catálogos o busca por título, serial o sinopsis.</p>

        <div className="viewer-filters">
          <input
            type="search"
            placeholder="Buscar media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={filters.genero} onChange={(e) => updateFilter('genero', e.target.value)}>
            <option value="">Todos los géneros</option>
            {uniqueValues.generos.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={filters.director} onChange={(e) => updateFilter('director', e.target.value)}>
            <option value="">Todos los directores</option>
            {uniqueValues.directores.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={filters.productora} onChange={(e) => updateFilter('productora', e.target.value)}>
            <option value="">Todas las productoras</option>
            {uniqueValues.productoras.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={filters.tipo} onChange={(e) => updateFilter('tipo', e.target.value)}>
            <option value="">Todos los tipos</option>
            {uniqueValues.tipos.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button
            className="btn"
            type="button"
            onClick={() => {
              setSearch('');
              setFilters({ genero: '', director: '', productora: '', tipo: '' });
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <section className="carousel-section card" aria-label="Carrusel de medias filtradas">
        <div className="carousel-header">
          <h3>Resultados en carrusel</h3>
          <div className="carousel-controls">
            <button type="button" className="btn" aria-label="Mover carrusel a la izquierda" onClick={() => scrollCarousel('prev')}>
              &#8592;
            </button>
            <button type="button" className="btn" aria-label="Mover carrusel a la derecha" onClick={() => scrollCarousel('next')}>
              &#8594;
            </button>
          </div>
        </div>

        <div className="carousel-track" ref={carouselRef}>
          {filteredMedias.length === 0 && <p className="empty-state">No se encontraron resultados.</p>}
          {filteredMedias.map((media) => (
            <article
              className="preview-card"
              key={`${media.serial}-${media._id || media.titulo}`}
              onClick={() => setSelectedMedia(media)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedMedia(media);
                }
              }}
            >
              <img
                src={getCoverUrl(media)}
                alt={`Vista previa de ${media.titulo}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="preview-body">
                <h3>{media.titulo}</h3>
                <p>{media.sinopsis || 'Sinopsis no disponible.'}</p>
                <ul>
                  <li><strong>Género:</strong> {media.generoName}</li>
                  <li><strong>Director:</strong> {media.directorName}</li>
                  <li><strong>Productora:</strong> {media.productoraName}</li>
                  <li><strong>Tipo:</strong> {media.tipoName}</li>
                  <li><strong>Año:</strong> {media.anioEstreno || '-'}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedMedia && (
        <div className="media-modal-overlay" onClick={() => setSelectedMedia(null)} role="presentation">
          <article className="media-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="media-modal-close" type="button" onClick={() => setSelectedMedia(null)}>
              Cerrar
            </button>

            <img
              src={getCoverUrl(selectedMedia)}
              alt={`Portada ampliada de ${selectedMedia.titulo}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getGenreFallback(selectedMedia.generoName);
              }}
            />

            <div className="media-modal-body">
              <h3>{selectedMedia.titulo}</h3>
              <p>{selectedMedia.sinopsis || 'Sinopsis no disponible.'}</p>
              <ul>
                <li><strong>Género:</strong> {selectedMedia.generoName}</li>
                <li><strong>Director:</strong> {selectedMedia.directorName}</li>
                <li><strong>Productora:</strong> {selectedMedia.productoraName}</li>
                <li><strong>Tipo:</strong> {selectedMedia.tipoName}</li>
                <li><strong>Año:</strong> {selectedMedia.anioEstreno || '-'}</li>
                <li>
                  <strong>Link de la media:</strong>{' '}
                  <a href={selectedMedia.url} target="_blank" rel="noreferrer">{selectedMedia.url || '-'}</a>
                </li>
              </ul>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
