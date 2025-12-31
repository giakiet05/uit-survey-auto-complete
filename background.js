console.log('UIT Survey Auto Complete: Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SET_BADGE_RUNNING') {
    chrome.action.setBadgeText({ text: 'RUN' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    sendResponse({ status: 'badge_set' });
  } else if (request.action === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ status: 'badge_cleared' });
  }
  return true;
});
