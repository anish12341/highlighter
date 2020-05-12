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
},{}],3:[function(require,module,exports){
// This file is used to access the chrome extension popup
// All the html elements being accessed here are from popup.html
// chrome.extension.getBackgroundPage() can be used to get access of current page's console log
// Ex: chrome.extension.getBackgroundPage().console.log()
const beforeHighlight_popup = require('./beforeHighlight_popup/highlight.js');
const beforeHighlight_background = require('../background/beforeHighlight/highlight.js');

document.addEventListener('DOMContentLoaded', async () => {
  let beforeLogin = document.getElementById('before_login');
  let afterLogin = document.getElementById('after_login');  

  chrome.extension.getBackgroundPage().console.log('Document loaded!!');

  // A method to check whether user is logged in or not
  let isUserLoggedIn = await beforeHighlight_background.userLoggedIn();

  chrome.extension.getBackgroundPage().console.log('Is user loggedIN::', isUserLoggedIn);
  
  if (isUserLoggedIn) {
    chrome.extension.getBackgroundPage().console.log('I am already logged IN');  
    // Make "afterLogin" part visible from popup.html if user is already logged in  
    afterLogin.style.display = 'block';

    let logoutButton = document.getElementById('logout_button');

    // Set event on logout button
    logoutButton.onclick = (element) => {
      beforeHighlight_popup.logout();
      beforeHighlight_popup.hideShowLogin('logout', {beforeLogin, afterLogin});    
    };
  } else {
    chrome.extension.getBackgroundPage().console.log('I am NOT already logged IN', beforeLogin.style.display);    
    
    // Make "beforeLogin" part visible from popup.html if user is NOT logged in
    beforeLogin.style.display = 'block';

    let loginButton = document.getElementById('login_button_popup');
    let signupButton = document.getElementById('signup_button');

    // Set event on login button
    loginButton.onclick = (element) => {
      beforeHighlight_popup.openLogin();
    };
    
    // Set event on signup button
    signupButton.onclick = (element) => {
      beforeHighlight_popup.openSignup();
    };
  }
});
// chrome.tabs.executeScript( {
//   code: "window.getSelection().toString();"
// }, function(selection) {
//   document.getElementById("output").innerHTML = selection[0];
// });

// function onPageDetailsReceived(details) {
// 	document.getElementById('output').innerText = details.summary;
// }
// // When the popup HTML has loaded
// window.addEventListener('load', function(evt) {
//   // Get the event page
//   console.log("Here in event listener");
//   chrome.runtime.getBackgroundPage(function(eventPage) {
//       console.log("Here in event listener");    
//       // Call the getPageInfo function in the event page, passing in 
//       // our onPageDetailsReceived function as the callback. This injects 
//       // content.js into the current tab's HTML
//       eventPage.getPageDetails(onPageDetailsReceived);
//       });
//   });
},{"../background/beforeHighlight/highlight.js":1,"./beforeHighlight_popup/highlight.js":2}]},{},[3]);
