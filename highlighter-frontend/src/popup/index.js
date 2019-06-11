const beforeHighlight_popup = require('./beforeHighlight_popup/highlight.js');
const beforeHighlight_background = require('../background/beforeHighlight/highlight.js');

document.addEventListener('DOMContentLoaded', async () => {
  let beforeLogin = document.getElementById('before_login');
  let afterLogin = document.getElementById('after_login');  

  chrome.extension.getBackgroundPage().console.log('Document loaded!!');

  let isUserLoggedIn = await beforeHighlight_background.userLoggedIn();
  chrome.extension.getBackgroundPage().console.log('Is user loggedIN::', isUserLoggedIn);
  
  if (isUserLoggedIn) {
    chrome.extension.getBackgroundPage().console.log('I am already logged IN');    
    afterLogin.style.display = 'block';

    let logoutButton = document.getElementById('logout_button');

    logoutButton.onclick = (element) => {
      beforeHighlight_popup.logout();
      beforeHighlight_popup.hideShowLogin('logout', {beforeLogin, afterLogin});    
    };
  } else {
    chrome.extension.getBackgroundPage().console.log('I am NOT already logged IN', beforeLogin.style.display);    
    
    beforeLogin.style.display = 'block';

    let loginButton = document.getElementById('login_button_popup');
    let signupButton = document.getElementById('signup_button');

    loginButton.onclick = (element) => {
      beforeHighlight_popup.openLogin();
    };
    
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