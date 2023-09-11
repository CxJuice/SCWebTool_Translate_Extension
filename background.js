chrome.runtime.onInstalled.addListener(function() {
    // 设置默认翻译页面
    const defaultSites = ['uexcorp.space', 'ccugame.app'];
    const defaultSettings = {};
    defaultSites.forEach(site => {
      defaultSettings[site] = true;
    });
  
    chrome.storage.sync.set(defaultSettings);
  });
  