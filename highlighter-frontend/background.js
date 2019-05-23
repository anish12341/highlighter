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

// This function is called onload in the popup code
// function getPageDetails(callback) {
//   console.log("I am here");
// 	// Inject the content script into the current page 
// 	chrome.tabs.executeScript(null, { file: 'content.js' }); 
// 	// Perform the callback when a message is received from the content script
// 	chrome.runtime.onMessage.addListener(function(message)  { 
//     // Call the callback function
//     console.log("I have a message::", message);
// 		callback(message); 
// 	}); 
// };

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)  { 
  // Call the callback function
  console.log("I have a message::", request.message);
  sendResponse(request.message); 
}); 