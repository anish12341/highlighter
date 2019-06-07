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