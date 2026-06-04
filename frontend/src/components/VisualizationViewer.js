import React, { useState } from 'react';
import axios from 'axios';

const VisualizationViewer = ({ description }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try { const res = await axios.post('/api/visualize', { description }); setImageUrl(res.data.imageUrl); }
    catch (err) { alert('Failed to generate'); }
    finally { setLoading(false); }
  };
  return (
    <div>
      <button onClick={generate} disabled={loading}>🎨 Сгенерировать 3D-визуализацию</button>
      {loading && <p>ИИ создаёт визуализацию...</p>}
      {imageUrl && <img src={imageUrl} alt="Визуализация" style={{ maxWidth: '100%', marginTop: '10px' }} />}
    </div>
  );
};

export default VisualizationViewer;