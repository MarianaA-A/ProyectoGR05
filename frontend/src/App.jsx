import { useEffect, useState } from 'react';
import GeneroModule from './genero/GeneroModule';
import DirectorModule from './director/DirectorModule';
import ProductoraModule from './productora/ProductoraModule';
import TipoModule from './tipo/TipoModule';
import MediaModule from './media/MediaModule';
import InformacionModule from './reportes/ReportesModule';
import MediaViewerModule from './media/MediaViewerModule';
import { directorApi, generoApi, productoraApi, tipoApi, mediaApi } from './shared/services/api';

export default function App() {
  const [catalogs, setCatalogs] = useState({
    generos: [],
    directores: [],
    productoras: [],
    tipos: [],
    medias: []
  });

  const [globalMessage, setGlobalMessage] = useState('');
  const [activeTab, setActiveTab] = useState('admin');

  const loadCatalogs = async () => {
    try {
      const [generos, directores, productoras, tipos, medias] = await Promise.all([
        generoApi.getAll(),
        directorApi.getAll(),
        productoraApi.getAll(),
        tipoApi.getAll(),
        mediaApi.getAll()
      ]);

      setCatalogs({ generos, directores, productoras, tipos, medias });
      setGlobalMessage('Datos cargados correctamente');
    } catch (error) {
      setGlobalMessage(`Error cargando catálogos: ${error.message}`);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  return (
    <main className="container">
      <header className="main-header">
        <h1>Caso de estudio "Peliculas" - IU Digital</h1>
        <button className="btn" type="button" onClick={loadCatalogs}>Recargar catálogos</button>
      </header>

      <div className="tabs-row" role="tablist" aria-label="Vistas de la aplicación">
        <button
          type="button"
          role="tab"
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          aria-selected={activeTab === 'admin'}
          onClick={() => setActiveTab('admin')}
        >
          Gestión Administrativa
        </button>
        <button
          type="button"
          role="tab"
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
          aria-selected={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
        >
          Vista Usuario
        </button>
      </div>

      {activeTab === 'admin' ? (
        <div className="modules-grid">
          <GeneroModule generos={catalogs.generos} onDataChange={loadCatalogs} />
          <DirectorModule directores={catalogs.directores} onDataChange={loadCatalogs} />
          <ProductoraModule productoras={catalogs.productoras} onDataChange={loadCatalogs} />
          <TipoModule tipos={catalogs.tipos} onDataChange={loadCatalogs} />
          <MediaModule
            generos={catalogs.generos}
            directores={catalogs.directores}
            productoras={catalogs.productoras}
            tipos={catalogs.tipos}
            medias={catalogs.medias}
            onDataChange={loadCatalogs}
          />
          <InformacionModule
            generos={catalogs.generos}
            directores={catalogs.directores}
            productoras={catalogs.productoras}
            tipos={catalogs.tipos}
            medias={catalogs.medias}
          />
        </div>
      ) : (
        <MediaViewerModule
          medias={catalogs.medias}
          generos={catalogs.generos}
          directores={catalogs.directores}
          productoras={catalogs.productoras}
          tipos={catalogs.tipos}
        />
      )}

      {globalMessage && <p className="global-message">{globalMessage}</p>}
    </main>
  );
}
