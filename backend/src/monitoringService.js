async function startMonitoring(projectId, contractorAddress, checkInterval = 86400000) {
  setInterval(async () => {
    const isCompleted = await checkCompletion(projectId);
    if (isCompleted) console.log(`Project ${projectId} completed, trigger approval`);
  }, checkInterval);
}

async function checkCompletion(projectId) {
  return false; // заглушка
}

module.exports = { startMonitoring };