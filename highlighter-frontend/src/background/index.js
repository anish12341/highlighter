/**
 * What are backgroup scripts?
 * Background scripts work behind the scenes. Content script sends messages to the background scripts
 * because background scripts can not access web page content by them selves.
 */
const beforeHighlight = require('./beforeHighlight/highlight.js');
const afterHighlight = require('./afterHighlight/highlight.js');
const beforeHighlight_popup = require('../popup/beforeHighlight_popup/highlight.js');

// This flag remembers that there's something to highlight after returing from login/signup
var previousHighlight = false;
var dataToHighlight = null;

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
  console.log("Sender: ", sender);
  if (request.message === 'setText') {
    let userLoggedIn = await beforeHighlight.userLoggedIn();
    var dataToSend = {
      selected_html: request.data,
      xpath: request.xpath,
      url: sender.url
    }
    if(userLoggedIn.isLoggedIn) {
      dataToSend.userid = userLoggedIn.userData.id;
      afterHighlight.postHighlight(url= 'http://127.0.0.1:3000/highlights/new', data=dataToSend);
      console.log('User already loggedIn');
    } else {
      // Setting a state which will be used to know that there is a highlight on hold before going to login/signup
      previousHighlight = true;
      dataToHighlight = dataToSend;

      await chrome.storage.sync.set({leavingFrom: sender.tab.id});
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
    console.log("Sender is: ", sender.tab.id);
    if (request.message === 'userData') {
      chrome.storage.sync.set({user: request.data}, async () => {
        console.log('Value is set to ', request.data);

        // Checking if there is a highlight on hold before going to login/signup
        if (previousHighlight) {
          dataToHighlight.userid = request.data.id;
          afterHighlight.postHighlight(url= 'http://127.0.0.1:3000/highlights/new', data=dataToHighlight);
          previousHighlight = false;
        }
        setTimeout(async () => {
          console.log("Setting timeout!");
          await chrome.tabs.remove(sender.tab.id);
          chrome.storage.sync.get('leavingFrom', async (lastTabId) => {
            console.log("Last tab ID: ", lastTabId);
            await chrome.tabs.update(lastTabId.leavingFrom, {active: true});
          });
        }, 5000);
      });
    }
  });