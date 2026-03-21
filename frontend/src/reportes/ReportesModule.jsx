import { useState, useEffect } from 'react';
import ModuleCard from '../shared/components/ModuleCard';
import { generoApi, directorApi, productoraApi, tipoApi, mediaApi } from '../shared/services/api';

export default function InformacionModule({
  generos = [],
  directores = [],
  productoras = [],
  tipos = [],
  medias = []
}) {
  const [selectedModule, setSelectedModule] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const modules = [
    { value: 'generos', label: 'Géneros', data: generos },
    { value: 'directores', label: 'Directores', data: directores },
    { value: 'productoras', label: 'Productoras', data: productoras },
    { value: 'tipos', label: 'Tipos', data: tipos },
    { value: 'medias', label: 'Medias', data: medias }
  ];

  const loadData = (moduleType) => {
    setLoading(true);
    setMessage('');
    try {
      const module = modules.find(m => m.value === moduleType);
      if (module) {
        setData(module.data);
        setMessage(`Datos de ${module.label} cargados correctamente`);
      }
    } catch (error) {
      setMessage(`Error al cargar datos: ${error.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedModule) loadData(selectedModule);
  }, [selectedModule, generos, directores, productoras, tipos, medias]);

  const resolveRelation = (itemField, list, defaultVal = '-') => {
    if (!itemField) return defaultVal;
    let found;
    
    if (typeof itemField === 'string') {
      found = list.find((x) => x._id === itemField || x._id === itemField.toString());
    } else if (typeof itemField === 'object') {
      if (itemField.nombre || itemField.nombres) return itemField.nombre || itemField.nombres;
      found = list.find((x) => x._id === itemField._id?.toString() || x._id === itemField._id);
    }
    
    return found ? (found.nombre || found.nombres || defaultVal) : defaultVal;
  };

  const getHeaders = () => {
    switch (selectedModule) {
      case 'generos':
        return ['Nombre', 'Descripción', 'Estado'];
      case 'directores':
        return ['Nombres', 'Estado'];
      case 'productoras':
        return ['Nombre', 'Estado', 'Fecha Creación', 'Eslogan'];
      case 'tipos':
        return ['Nombre', 'Descripción'];
      case 'medias':
        return ['Serial', 'Título', 'Año Estreno', 'Género', 'Director', 'Productora', 'Tipo'];
      default:
        return [];
    }
  };

  const getRowData = (item) => {
    switch (selectedModule) {
      case 'generos':
        return [item.nombre || '-', item.descripcion || '-', item.estado || '-'];
      case 'directores':
        return [item.nombres || '-', item.estado || '-'];
      case 'productoras':
        return [item.nombre || '-', item.estado || '-', item.fechaCreacion || '-', item.slogan || '-'];
      case 'tipos':
        return [item.nombre || '-', item.descripcion || '-'];
      case 'medias':
        return [
          item.serial || '-',
          item.titulo || '-',
          item.anioEstreno || '-',
          resolveRelation(item.genero, generos),
          resolveRelation(item.director, directores),
          resolveRelation(item.productora, productoras),
          resolveRelation(item.tipo, tipos)
        ];
      default:
        return [];
    }
  };

  const renderTable = () => {
    if (!data.length) return null;
    const module = modules.find(m => m.value === selectedModule);
    if (!module) return null;

    return (
      <div className="print-table-container">
        <h3>Reporte de {module.label}</h3>
        <div className="print-table-wrapper">
          <table className="print-table">
            <thead>
              <tr>
                {getHeaders().map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item._id || index}>
                  {getRowData(item).map((value, cellIndex) => (
                    <td key={cellIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="print-info">
          <p>Total de registros: {data.length}</p>
          <p>Fecha de generación: {new Date().toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <ModuleCard title="Información">
      <div className="grid-3">
        <div>
          <label htmlFor="module-select">Seleccionar módulo:</label>
          <select
            id="module-select"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            {modules.map((module) => (
              <option key={module.value} value={module.value}>
                {module.label}
              </option>
            ))}
          </select>
        </div>
        {loading && <div>Cargando datos...</div>}
      </div>
      {message && <div className="module-message">{message}</div>}
      {selectedModule && data.length > 0 && renderTable()}
    </ModuleCard>
  );
}