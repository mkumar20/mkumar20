/**
 * Chrome Extension Content Script
 * Runs in the context of the active web page.
 */

console.log('🚀 Sandbox Chrome Extension: Content Script fully loaded onto page!');

// Listen for messages from the popup or background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📬 Content Script received message:', request);

  if (request.action === 'ping') {
    // Reply back to popup
    sendResponse({ status: 'pong', url: window.location.href });
  }

  // Return true if you want to respond asynchronously
  return false;
});
