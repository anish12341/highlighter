// This file is used to access the chrome extension popup
// All the html elements being accessed here are from popup.html
// chrome.extension.getBackgroundPage() can be used to get access of current page's console log
// Ex: chrome.extension.getBackgroundPage().console.log()
const beforeHighlight_popup = require('./beforeHighlight_popup/highlight.js');
const beforeHighlight_background = require('../background/beforeHighlight/highlight.js');

document.addEventListener('DOMContentLoaded', async () => {
  let beforeLogin = document.getElementById('before_login');
  let afterLogin = document.getElementById('after_login');  


  // A method to check whether user is logged in or not
  let isUserLoggedIn = await beforeHighlight_background.userLoggedIn();

  chrome.extension.getBackgroundPage().console.log('Is user loggedIN::', isUserLoggedIn.isLoggedIn);
  
  if (isUserLoggedIn.isLoggedIn) {
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