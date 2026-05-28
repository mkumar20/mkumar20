document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('action-btn');
  const statusDisplay = document.getElementById('status-display');

  actionBtn.addEventListener('click', async () => {
    statusDisplay.textContent = 'Pinging...';
    
    try {
      // 1. Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        statusDisplay.textContent = 'Error: No active tab found';
        return;
      }

      // 2. Send runtime message to the injected content.js
      chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          statusDisplay.textContent = 'Content script not injected yet';
          console.warn('Ping failed:', chrome.runtime.lastError.message);
        } else if (response && response.status === 'pong') {
          statusDisplay.textContent = 'Received Pong from page!';
          statusDisplay.style.color = '#10b981';
        } else {
          statusDisplay.textContent = 'Invalid response received';
        }
      });
    } catch (err) {
      statusDisplay.textContent = `Error: ${err.message}`;
    }
  });
});
