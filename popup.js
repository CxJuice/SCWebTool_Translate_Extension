document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('translationToggle');

  // 获取当前标签页的URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = new URL(tabs[0].url);
    const host = url.hostname;

    // 加载设置
    chrome.storage.sync.get([host], function(data) {
      toggle.checked = data[host] || false;
    });

    // 保存设置
    toggle.addEventListener('change', function() {
      const setting = {};
      setting[host] = toggle.checked;
      chrome.storage.sync.set(setting);
    });
  });
});
