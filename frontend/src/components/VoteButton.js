import React, { useState } from 'react';

const VoteButton = ({ proposalId, governorContract, account }) => {
  const [voting, setVoting] = useState(false);
  const castVote = async (support) => {
    if (!governorContract) return alert('Contract not connected');
    setVoting(true);
    try {
      const tx = await governorContract.castVote(proposalId, support);
      await tx.wait();
      alert(`Voted ${support === 0 ? 'Against' : support === 1 ? 'For' : 'Abstain'} successfully`);
    } catch (error) { console.error(error); alert('Voting failed'); }
    finally { setVoting(false); }
  };
  return (
    <div>
      <button onClick={() => castVote(1)} disabled={voting}>✅ За</button>
      <button onClick={() => castVote(0)} disabled={voting}>❌ Против</button>
      <button onClick={() => castVote(2)} disabled={voting}>⚪ Воздержался</button>
    </div>
  );
};

export default VoteButton;