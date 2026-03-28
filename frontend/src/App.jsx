import { useEffect, useState } from 'react';
import GeneroModule from './genero/GeneroModule';
import DirectorModule from './director/DirectorModule';
import ProductoraModule from './productora/ProductoraModule';
import TipoModule from './tipo/TipoModule';
import MediaModule from './media/MediaModule';
import InformacionModule from './reportes/ReportesModule';
import MediaViewerModule from './media/MediaViewerModule';
import { directorApi, generoApi, productoraApi, tipoApi, mediaApi } from './shared/services/api';

const ADMIN_USERNAME = 'Mariana.Agudelo';
const ADMIN_PASSWORD = 'Samantha-0510';

export default function App() {
  const [catalogs, setCatalogs] = useState({
    generos: [],
    directores: [],
    productoras: [],
    tipos: [],
    medias: []
  });

  const [globalMessage, setGlobalMessage] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const [adminAuth, setAdminAuth] = useState({ username: '', password: '' });
  const [adminAuthMessage, setAdminAuthMessage] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');

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

  const handleAdminTabClick = () => {
    setActiveTab('admin');
    if (!isAdminAuthenticated) {
      setAdminAuthMessage('Inicia sesión para acceder a Gestión Administrativa.');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();

    const username = adminAuth.username.trim();
    const password = adminAuth.password;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminAuth({ username: '', password: '' });
      setAdminAuthMessage('Acceso autorizado.');
      sessionStorage.setItem('adminAuth', 'true');
      return;
    }

    setAdminAuthMessage('Credenciales inválidas. Verifica usuario y contraseña.');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminAuth({ username: '', password: '' });
    setAdminAuthMessage('Sesión administrativa finalizada.');
    setActiveTab('user');
    sessionStorage.removeItem('adminAuth');
  };

  return (
    <main className="container">
      <header className="main-header">
        <h1>Caso de estudio "Peliculas" - IU Digital</h1>
        <div className="header-actions">
          <button className="btn" type="button" onClick={loadCatalogs}>Recargar catálogos</button>
          {isAdminAuthenticated && (
            <button className="btn danger" type="button" onClick={handleAdminLogout}>Cerrar sesión admin</button>
          )}
        </div>
      </header>

      <div className="tabs-row" role="tablist" aria-label="Vistas de la aplicación">
        <button
          type="button"
          role="tab"
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          aria-selected={activeTab === 'admin'}
          onClick={handleAdminTabClick}
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
        isAdminAuthenticated ? (
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
          <section className="admin-auth card" aria-label="Acceso administrativo">
            <h2>Acceso de Gestión Administrativa</h2>
            <p>Solo el usuario autorizado puede acceder a esta pestaña.</p>
            <form className="grid-3" onSubmit={handleAdminLogin}>
              <input
                type="text"
                placeholder="Usuario"
                value={adminAuth.username}
                onChange={(e) => setAdminAuth((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={adminAuth.password}
                onChange={(e) => setAdminAuth((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <div className="actions">
                <button className="btn primary" type="submit">Iniciar sesión</button>
              </div>
            </form>
            {adminAuthMessage && <p className="module-message">{adminAuthMessage}</p>}
          </section>
        )
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
