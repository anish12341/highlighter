(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({color: '#f4f142'}, () => {
    console.log("The color is yellow.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { 
  // Call the callback function
  console.log("I have a message::", request.data);
  if (request.message === 'setText') {
    console.log('I got the message!');
  }
  sendResponse(request.message); 
});

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log("From browser::", request);
    // if (sender.url == blocklistedWebsite)
    //   return;  // don't allow this web page access
    // if (request.openUrlInEditor)
    //   openUrl(request.openUrlInEditor);
  });
},{}]},{},[1]);
