import React, { useState, useEffect } from 'react';
import ProposalList from './components/ProposalList';
import CreateProposal from './components/CreateProposal';
import { ethers } from 'ethers';
import governorABI from './contracts/AgoraGovernorABI.json';

const GOVERNOR_ADDRESS = process.env.REACT_APP_GOVERNOR_ADDRESS || '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [governorContract, setGovernorContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) setProvider(new ethers.BrowserProvider(window.ethereum));
    else alert('Please install MetaMask');
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const contract = new ethers.Contract(GOVERNOR_ADDRESS, governorABI, signer);
      setGovernorContract(contract);
      await fetchProposals(contract);
    } catch (error) { console.error(error); }
  };

  const fetchProposals = async (contract) => {
    setLoading(true);
    try {
      const filter = contract.filters.ProposalCreated();
      const events = await contract.queryFilter(filter);
      const proposalList = await Promise.all(events.map(async (event) => ({
        id: event.args.proposalId.toString(),
        description: event.args.description,
        proposer: event.args.proposer,
        startBlock: event.args.startBlock.toString(),
        endBlock: event.args.endBlock.toString(),
        state: await contract.state(event.args.proposalId)
      })));
      setProposals(proposalList);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <div className="container">
      <h1>🏛️ DigitalAgora – Управление ТСЖ</h1>
      {!account ? <button onClick={connectWallet}>Подключить MetaMask</button> : (
        <div>
          <p>👤 Аккаунт: {account.slice(0,6)}...{account.slice(-4)}</p>
          <CreateProposal governorContract={governorContract} account={account} />
          <ProposalList proposals={proposals} loading={loading} governorContract={governorContract} account={account} />
        </div>
      )}
    </div>
  );
}

export default App;