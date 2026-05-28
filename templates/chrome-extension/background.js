/**
 * Chrome Extension Background Service Worker (Manifest V3)
 * Handles long-running states, system notifications, and active events.
 */

chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ Extension Installed Successfully!', details);
  
  if (details.reason === 'install') {
    console.log('🎉 First time install - Setup configuration defaults');
    chrome.storage.local.set({ firstLaunch: Date.now() });
  }
});

// A simple listener for tab activation events
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`🌐 Switched to tab ID: ${activeInfo.tabId}`);
});
