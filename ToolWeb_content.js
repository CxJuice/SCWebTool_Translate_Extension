// 获取当前页面的URL
const url = new URL(window.location.href);
const host = url.hostname;

// 检查设置
chrome.storage.sync.get([host], function(data) {
  if (data[host]) {
    // content.js

window.addEventListener('load', function(event) {
  myScript();
});

document.addEventListener('click', function(event) {
  myScript();
});

async function myScript() {
  const SUPPORT_LANG = ["zh-CN", "ja"];
  const lang = (navigator.language || navigator.userLanguage);
  let locales = await getLocales(lang);

  translateByCssSelector();
  translateDesc();
  traverseElement(document.body);
  watchUpdate();

  async function getLocales(lang) {
    if(lang.startsWith("zh")) {
      lang = "zh-CN";
    }
    if(SUPPORT_LANG.includes(lang)) {
      const response = await fetch('https://pub-3798dc65b69e474ab006cba98cbbbfd9.r2.dev/zh-CN-uex2.2.json');
      const data = await response.json();
      return data;
    }
    return {
      css: [],
      dict: {}
    };
  }

  function translateRelativeTimeEl(el) {
    const datetime = $(el).attr('datetime');
    $(el).text(timeago.format(datetime, lang.replace('-', '_')));
  }
 
  function translateElement(el) {
    // Get the text field name
    let k;
    if(el.tagName === "INPUT") {
      if (el.type === 'button' || el.type === 'submit') {
        k = 'value';
      } else {
        k = 'placeholder';
      }
    } else {
      k = 'data';
    }
 
    const txtSrc = el[k].trim();
    const key = txtSrc.toLowerCase()
        .replace(/\xa0/g, ' ') // replace '&nbsp;'
        .replace(/\s{2,}/g, ' ');
 
    if(locales.dict[key]) {
      el[k] = el[k].replace(txtSrc, locales.dict[key])
    }
  }
 
  function shoudTranslateEl(el) {
    const blockIds = [];
    const blockClass = [
      "css-truncate" // 过滤文件目录
    ];
    const blockTags = [ "IMG", "svg"];
 
    if(blockTags.includes(el.tagName)) {
      return false;
    }
 
    if(el.id && blockIds.includes(el.id)) {
      return false;
    }
 
    if(el.classList) {
      for(let clazz of blockClass) {
        if(el.classList.contains(clazz)) {
          return false;
        }
      }
    }
 
    return true;
  }
 
  function traverseElement(el) {
    if(!shoudTranslateEl(el)) {
      return
    }
 
    for(const child of el.childNodes) {
      if(["RELATIVE-TIME", "TIME-AGO"].includes(el.tagName)) {
        translateRelativeTimeEl(el);
        return;
      }
 
      if(child.nodeType === Node.TEXT_NODE) {
        translateElement(child);
      }
      else if(child.nodeType === Node.ELEMENT_NODE) {
        if(child.tagName === "INPUT") {
          translateElement(child);
        } else {
          traverseElement(child);
        }
      } else {
        // pass
      }
    }
  }
 
  function watchUpdate() {
    const m = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new m(function (mutations, observer) {
      for(let mutationRecord of mutations) {
        for(let node of mutationRecord.addedNodes) {
          traverseElement(node);
        }
      }
    });
 
    observer.observe(document.body, {
      subtree: true,
      characterData: true,
      childList: true,
    });
  }
 
  // translate "about"
  function translateDesc() {
    $(".repository-content .f4").append("<br/>");
    $(".repository-content .f4").append("<a id='translate-me' href='#' style='color:rgb(27, 149, 224);font-size: small'>翻译</a>");
    $("#translate-me").click(function() {
      // get description text
      const desc = $(".repository-content .f4")
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim();
 
      if(!desc) {
        return;
      }
 
      GM_xmlhttpRequest({
        onload: function(res) {
          if (res.status === 200) {
            $("#translate-me").hide();
            // render result
            const text = res.responseText;
            $(".repository-content .f4").append("<span style='font-size: small'>TK翻译</span>");
            $(".repository-content .f4").append("<br/>");
            $(".repository-content .f4").append(text);
          } else {
            alert("翻译失败");
          }
        }
      });
    });
  }
 
  function translateByCssSelector() {
    if(locales.css) {
      for(var css of locales.css) {
        if($(css.selector).length > 0) {
          if(css.key === '!html') {
            $(css.selector).html(css.replacement);
          } else {
            $(css.selector).attr(css.key, css.replacement);
          }
        }
      }
    }
  }
}
  }
});
