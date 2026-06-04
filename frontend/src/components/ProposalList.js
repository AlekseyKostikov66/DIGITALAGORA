import React, { useState, useEffect } from 'react';
import VoteButton from './VoteButton';
import axios from 'axios';

const ProposalList = ({ proposals, loading, governorContract, account }) => {
  const [proposalsData, setProposalsData] = useState([]);
  useEffect(() => {
    const fetchMetadata = async () => {
      const enriched = await Promise.all(proposals.map(async (prop) => {
        let metadata = null;
        if (prop.description?.startsWith('ipfs://')) {
          const cid = prop.description.slice(7);
          try { const res = await axios.get(`/api/proposals/${cid}`); metadata = res.data; } catch (e) {}
        }
        return { ...prop, metadata };
      }));
      setProposalsData(enriched);
    };
    if (proposals.length) fetchMetadata();
  }, [proposals]);

  if (loading) return <p>Загрузка...</p>;
  return (
    <div>
      <h2>📋 Предложения</h2>
      {proposalsData.length === 0 ? <p>Нет предложений.</p> : proposalsData.map(prop => (
        <div key={prop.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '5px' }}>
          <h3>{prop.metadata?.title || 'Без названия'}</h3>
          <p>{prop.metadata?.description || prop.description}</p>
          <p><strong>Автор:</strong> {prop.proposer}</p>
          <p><strong>Статус:</strong> {prop.state}</p>
          <VoteButton proposalId={prop.id} governorContract={governorContract} account={account} />
        </div>
      ))}
    </div>
  );
};

export default ProposalList;