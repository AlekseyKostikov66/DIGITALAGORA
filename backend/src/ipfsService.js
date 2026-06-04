const { create } = require('ipfs-http-client');

const ipfs = create({ url: process.env.IPFS_URL || 'http://localhost:5001/api/v0' });

async function uploadToIPFS(content) {
  try {
    const { cid } = await ipfs.add(JSON.stringify(content));
    return cid.toString();
  } catch (error) {
    console.error('IPFS upload error:', error);
    // Заглушка для тестов без IPFS
    return 'QmFakeCidForTesting';
  }
}

async function getFromIPFS(cid) {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return { title: 'Fallback', description: 'IPFS not available' };
  }
}

module.exports = { uploadToIPFS, getFromIPFS };