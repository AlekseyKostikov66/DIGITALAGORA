import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const ContractorFinder = ({ proposalId, proposalDescription, budget, governorContract, account }) => {
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    setLoading(true);
    try { const res = await axios.post('/api/find-contractor', { description: proposalDescription, budget }); setContractor(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  const assignContractor = async () => {
    if (!governorContract) return;
    try {
      const vaultAddress = '0xYourProjectVault'; // заменить из deployed.json
      const vaultABI = []; // добавить ABI ProjectVault
      const vaultContract = new ethers.Contract(vaultAddress, vaultABI, governorContract.signer);
      const milestonePercentages = [50, 50];
      const tx = await vaultContract.assignContractor(proposalId, contractor.wallet, budget, milestonePercentages, 'ipfs://...');
      await tx.wait();
      alert('Исполнитель назначен!');
    } catch (err) { console.error(err); alert('Ошибка назначения'); }
  };
  return (
    <div>
      <h3>🔍 Найти исполнителя</h3>
      <button onClick={search} disabled={loading}>Поиск</button>
      {contractor && (
        <div>
          <p><strong>{contractor.name}</strong> (рейтинг: {contractor.rating})</p>
          <p>Стоимость: {contractor.estimatedCost} токенов</p>
          <button onClick={assignContractor}>Назначить</button>
        </div>
      )}
    </div>
  );
};

export default ContractorFinder;