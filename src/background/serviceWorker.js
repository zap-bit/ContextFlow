chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === "install") await chrome.runtime.openOptionsPage();
});
