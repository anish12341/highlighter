/**
 * What are backgroup scripts?
 * Background scripts work behind the scenes. Content script sends messages to the background scripts
 * because background scripts can not access web page content by them selves.
 */
const beforeHighlight = require('./beforeHighlight/highlight.js');
const beforeHighlight_popup = require('../popup/beforeHighlight_popup/highlight.js');

/**
 * Specifies on which URLs background scripts would be activated.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({color: '#f4f142'}, () => {
    console.log("The color is yellow.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: 'linkedin.com'},
      }),
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'github.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

/**
 * This listener listens for any messages coming from content scripts and takes appropriate
 * actions.
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => { 
  // Call the callback function
  console.log("I have a message::", request.data);
  if (request.message === 'setText') {
    let userLoggedIn = await beforeHighlight.userLoggedIn();
    if(userLoggedIn) {
      console.log('User already loggedIn');
    } else {
      beforeHighlight_popup.openLogin();
      console.log('User NOT logged IN');
    }
  }
  sendResponse(request.message); 
});

/**
 * When user is logged in "user" is set in chrome.storage to remember that user is logged in.
 * This message comes from backend done.ejs
 */
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log("From browser::", request);
    if (request.message === 'userData') {
      chrome.storage.sync.set({user: request.data}, function() {
        console.log('Value is set to ', request.data);
      });
    }
  });