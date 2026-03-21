import { useEffect, useState } from 'react';
import GeneroModule from './genero/GeneroModule';
import DirectorModule from './director/DirectorModule';
import ProductoraModule from './productora/ProductoraModule';
import TipoModule from './tipo/TipoModule';
import MediaModule from './media/MediaModule';
import InformacionModule from './reportes/ReportesModule';
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

      <div className="modules-grid">
        <GeneroModule onDataChange={loadCatalogs} />
        <DirectorModule onDataChange={loadCatalogs} />
        <ProductoraModule onDataChange={loadCatalogs} />
        <TipoModule onDataChange={loadCatalogs} />
        <MediaModule
          generos={catalogs.generos}
          directores={catalogs.directores}
          productoras={catalogs.productoras}
          tipos={catalogs.tipos}
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

      {globalMessage && <p className="global-message">{globalMessage}</p>}
    </main>
  );
}
