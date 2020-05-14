(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Method to post highlight
 */
const postHighlight = async (url = '', data = {}) => {
  // Default options are marked with *
  console.log("I want to send post");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

module.exports = {postHighlight};
},{}],2:[function(require,module,exports){
const userLoggedIn = () => {
  return new Promise (
    async(resolve, reject) => {
      // chrome.storage.sync.clear();
      chrome.storage.sync.get('user', (data) => {
        console.log('Value currently is ', data);    
        if (!data.user) {
          console.log('Returning false');
          return resolve({isLoggedIn: false, userData: null});
        }
        console.log('Returning true');    
        return resolve({isLoggedIn: true, userData: data.user});
      })
    }
  );
};

module.exports = {userLoggedIn};
},{}],3:[function(require,module,exports){
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
},{"../popup/beforeHighlight_popup/highlight.js":4,"./afterHighlight/highlight.js":1,"./beforeHighlight/highlight.js":2}],4:[function(require,module,exports){
// A module within popup functionality

/**
 * Method to open login screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openLogin = () => {
  chrome.extension.getBackgroundPage().console.log('Loging button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: 'http://127.0.0.1:3000/users/login', active: true}, (tabs) => {
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to open signup screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openSignup = () => {
  chrome.extension.getBackgroundPage().console.log('Signup button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: 'http://127.0.0.1:3000/users/signup', active: true}, (tabs) => {
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to logout which clears chrome.storage which stores user information when user
 * is logged in
 */
const logout = () => {
  chrome.extension.getBackgroundPage().console.log('Logout button is clicked after!');
  chrome.storage.sync.clear();
}

/**
 * Logic to change display property
 */
const hideShowLogin = (type, elementObject) => {
  elementObject.afterLogin.style.display = type === 'logout' ? 'none' : 'block';
  elementObject.beforeLogin.style.display = type === 'logout' ? 'block' : 'none';
}
module.exports = {openLogin, openSignup, logout, hideShowLogin};
},{}]},{},[3]);
