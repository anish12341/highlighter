/**
 * What are backgroup scripts?
 * Background scripts work behind the scenes. Content script sends messages to the background scripts
 * because background scripts can not access web page content by them selves.
 */
const beforeHighlight = require('./beforeHighlight/highlight.js');
const afterHighlight = require('./afterHighlight/highlight.js');
const beforeHighlight_popup = require('../popup/beforeHighlight_popup/highlight.js');
const afterHighlight_popup = require('../popup/afterHighlight_popup/highlight.js');

// This flag remembers that there's something to highlight after returing from login/signup
const previousHighlight = false;
const dataToHighlight = null;
const host = 'http://127.0.0.1:3000';

chrome.runtime.onConnect.addListener(() => {
  console.log("Connect");
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostContains: ''},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
})

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
        pageUrl: {hostContains: ''},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

/**
 * Message listener async
 */
const asyncMessageListener = async (request, sender) => {
  try {
    if (request.message === 'setText') {
      let userLoggedIn = await beforeHighlight.userLoggedIn();
      var dataToSend = {
        selected_html: request.data,
        xpath: request.xpath,
        highlight_color: request.highlightColor,
        url: sender.url,
        url_title: sender.tab.title,
        current_space: request.currentSpace,
        highlight_name: request.highlightName
      }
      if(userLoggedIn.isLoggedIn) {
        dataToSend.userid = userLoggedIn.userData.id;
        let postedHighlight = await afterHighlight.postHighlight(url= `${host}/highlights/new`, data=dataToSend, userLoggedIn.userData.accesstoken);
        console.log("Hey I want to send something: ", postedHighlight);
        return postedHighlight;
      } else {
        // Setting a state which will be used to know that there is a highlight on hold before going to login/signup
        previousHighlight = true;
        dataToHighlight = dataToSend;
  
        await chrome.storage.sync.set({leavingFrom: sender.tab.id});
        beforeHighlight_popup.openLogin();
        console.log('User NOT logged IN');
        return undefined
      }
    } else if (request.message === 'checkPopup') {
      await chrome.storage.sync.set({ openPopup: false });
      await chrome.storage.sync.set({ page: 1 });
      return undefined;
    } else if (request.message === 'deleteHighlight') {
      let highlighterid = request.highlighterid;
      console.log("I want to delete from content");
      await afterHighlight_popup.useAPI('deleteHighlight'
      ,'DELETE', `${host}/highlights/`, {highlighterid, userid: request.user.userData.id}, request.user.userData.accesstoken);
      return undefined;
    } else if (request.message === 'getUser') {
      console.log("Getting user for content");
      let isUserLoggedIn = await beforeHighlight.userLoggedIn();
      return isUserLoggedIn;
    } else if (request.message === 'getHighlight') {
      console.log("Getting highlights");
      let highlights = await afterHighlight_popup.useAPI('fetchHighlights'
        ,'GET', `${host}/highlights?`, {
          userid: request.userid, 
          type: 'content',
          url: sender.url
        }, request.accesstoken); 
      return highlights;
    }
  } catch (error) {

  }
  // sendResponse(request.message); 
}

/**
 * This listener listens for any messages coming from content scripts and takes appropriate
 * actions.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { 
  // Call the callback function
  console.log("I have a message::", request.data, sendResponse);
  console.log("Sender: ", sender);
  asyncMessageListener(request, sender).then((response) => {
      response.success = true;
      sendResponse(response);
  })
  .catch((error) => {
    error.success = false;
    sendResponse(error);
  }) ;
  return true;
});

/**
 * Trying to set up background script on startup
 */
chrome.runtime.onStartup.addListener(() => {});

/**
 * When user is logged in "user" is set in chrome.storage to remember that user is logged in.
 * This message comes from backend done.ejs
 */
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
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
            chrome.tabs.get(lastTabId.leavingFrom, async (tab) => {
              if (tab != undefined) {
                await chrome.tabs.update(lastTabId.leavingFrom, {active: true});
              }
            });
          });
        }, 5000);
      });
    } else if (request.message === 'getUser') {
      console.log("Getting user for content");
      let isUserLoggedIn = await beforeHighlight.userLoggedIn();
      return sendResponse(isUserLoggedIn);
    } else if (request.message === 'logoutUser') {
      console.log("Trying to logout!");
      chrome.storage.sync.clear();
      try {
        return sendResponse({
          logoutSuccessful: true,
          data: {}
        });
      } catch(error) {
        return sendResponse({
          logoutSuccessful: false,
          data: error
        });
      }
    }
  });