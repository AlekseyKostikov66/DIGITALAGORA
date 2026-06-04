import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const CreateProposal = ({ governorContract, account }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!governorContract) return alert('Contract not connected');
    setLoading(true);
    try {
      const res = await axios.post('/api/proposals', { title, description, author: account });
      const ipfsCid = res.data.ipfsCid;
      const metadataCid = `ipfs://${ipfsCid}`;
      const targets = [governorContract.target];
      const values = [0];
      const calldatas = ['0x'];
      const tx = await governorContract.propose(targets, values, calldatas, metadataCid);
      await tx.wait();
      alert('✅ Proposal created!');
      setTitle(''); setDescription('');
    } catch (error) {
      console.error(error);
      alert('Error creating proposal');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h2>📝 Создать предложение</h2>
      <form onSubmit={handleSubmit}>
        <label>Заголовок:</label><br />
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required /><br />
        <label>Описание:</label><br />
        <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} required /><br />
        <button type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</button>
      </form>
    </div>
  );
};

export default CreateProposal;