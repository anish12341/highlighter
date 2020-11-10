(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Method to post highlight
 */
const postHighlight = async (url = '', data = {}, accesstoken = '') => {
  // Default options are marked with *
  console.log("I want to send post", data);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `bearer ${accesstoken}`
    },
    body: JSON.stringify(data)
  });
  let resJson = await response.json();
  console.log("I want to send post::", resJson);
  return resJson;
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
        url_title: sender.tab.title
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
            chrome.tabs.get(lastTabId.leavingFrom, async (tab) => {
              if (tab != undefined) {
                await chrome.tabs.update(lastTabId.leavingFrom, {active: true});
              }
            });
          });
        }, 5000);
      });
    }
  });
},{"../popup/afterHighlight_popup/highlight.js":4,"../popup/beforeHighlight_popup/highlight.js":5,"./afterHighlight/highlight.js":1,"./beforeHighlight/highlight.js":2}],4:[function(require,module,exports){
var host = 'http://127.0.0.1:3000';

/**
 * General method to handle error 
 */
const handleError = () => {
  return new Promise (
    async (resolve, reject) => {
      console.log('Faced an error');
      let loaderDiv = document.getElementById('loader_div');
      let scrollingUL = document.getElementById('highlight_list');
      if (loaderDiv != undefined) {
        loaderDiv.style.display = 'none';
      }
      if (scrollingUL != undefined) {
        scrollingUL.style.display = 'none';
      }
      document.getElementById('no_highlight_p').innerHTML = "Sorry, We ran into an error! :(";
      document.getElementById('no_highlight_div').style.display = 'flex';
      return resolve();
    }
  )
}

/**
 * Method to open tab from highlights
 */
const urlFromHighlight = (url) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url, active: true}, (tabs) => {
    });
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to interact with back-end through APIs
 */

const useAPI = (objective = '', method = '', url = '', data = {}, accesstoken = '') => {
  return new Promise (
    async (resolve, reject) => {
      let paylod = {};
      if (objective == 'fetchHighlights') {
        if (method == 'GET') {
          let query = Object.keys(data)
             .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
             .join('&');
          url = url + query;
          paylod = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'authorization': `bearer ${accesstoken}`
            }
          }
        }
      } else if (objective == 'deleteHighlight') {
        if (method == 'DELETE') {
          paylod = {
            method,
            headers: {
              'Content-Type': 'application/json',
              'authorization': `bearer ${accesstoken}`
            },
            body: JSON.stringify(data)
          }
        }
      }
      fetch(url, paylod)
      .then(async (response) => {
        let resJson = await response.json();
        console.log('highlight status: ', resJson);
        if (resJson.status) {
          return resolve(resJson);
        } else {
          return reject();
        }
      })
      .catch(async (error) => {
        return reject(error);
      });
    }
  );
};

const deleteHighlight = () => {
  return new Promise (
    async (resolve, reject) => {

    }
  )
};

module.exports = {urlFromHighlight, useAPI, handleError};
},{}],5:[function(require,module,exports){
// A module within popup functionality
const host = 'http://127.0.0.1:3000';

/**
 * Method to open login screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openLogin = () => {
  // chrome.extension.getBackgroundPage().console.log('Loging button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/users/login`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to open signup screen from backend
 * TODO: generalize the host (http://127.0.0.1:3000/)
 */
const openSignup = () => {
  // chrome.extension.getBackgroundPage().console.log('Signup button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/users/signup`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}

/**
 * Method to logout which clears chrome.storage which stores user information when user
 * is logged in
 */
const logout = async () => {
  console.log('Logout button is clicked after!');
  await registerLoginSignup();
  chrome.storage.sync.clear();
}

/**
 * Logic to change display property
 */
const hideShowLogin = (type, elementObject) => {
  elementObject.afterLogin.style.display = type === 'logout' ? 'none' : 'block';
  elementObject.beforeLogin.style.display = type === 'logout' ? 'block' : 'none';
}

/**
 * Method to register events on Login signup button after pressing logout button
 */
const registerLoginSignup = () => {
  return new Promise(
    async (resolve, reject) => {
      try {
        setCurrentTab();
        let loginButton = document.getElementById('login_button_popup');
        let signupButton = document.getElementById('signup_button');
        // Set event on login button
        loginButton.onclick = async (element) => {
          openLogin();
        };
        
        // Set event on signup button
        signupButton.onclick = (element) => {
          openSignup();
        };
      } catch (error) {
        return reject(error);
      }
      return resolve();
    }
  )
}

/**
 * Method to set current tab so that it can remember where to land after login/signup
 */
const setCurrentTab = () => {
  var query = { active: true, currentWindow: true };
  chrome.tabs.query(query, async (currentTab) => {
    if (currentTab.length > 0) {
      await chrome.storage.sync.set({leavingFrom: currentTab[0].id});
    }
  });
};

/**
 * Method to take users to collaboration space page
 */
const openSpaces = ({ usertoken = "" }) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: `${host}/spaces?usertoken=${usertoken}`, active: true}, (tabs) => {
      // chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
}


module.exports = {openLogin, openSignup, logout, hideShowLogin, registerLoginSignup, setCurrentTab, openSpaces};
},{}]},{},[3]);
