(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const userLoggedIn = () => {
  return new Promise (
    async(resolve, reject) => {
      // chrome.storage.sync.clear();
      chrome.storage.sync.get('user', (data) => {
        console.log('Value currently is ', data);    
        if (!data.user) {
          console.log('Returning false');      
          return resolve(false);
        }
        console.log('Returning true');    
        return resolve(true);
      })
    }
  );
};

module.exports = {userLoggedIn};
},{}],2:[function(require,module,exports){
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
},{"../popup/beforeHighlight_popup/highlight.js":3,"./beforeHighlight/highlight.js":1}],3:[function(require,module,exports){
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
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabs[0].id);      
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
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabs[0].id);      
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
},{}]},{},[2]);
