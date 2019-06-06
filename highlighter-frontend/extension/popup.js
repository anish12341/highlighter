(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let changeColor = document.getElementById('changeColor');
let loginButton = document.getElementById('login_button_popup');
chrome.extension.getBackgroundPage().console.log("In POPUP.js::", loginButton);
chrome.storage.sync.get('color', (data) => {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = (element) => {
  // console.log("Element::", element);
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.extension.getBackgroundPage().console.log("Tabs::", tabs);    
    chrome.tabs.executeScript(
        tabs[0].id,
        {code: 'document.body.style.backgroundColor = "' + color + '";'});
  });
};

loginButton.onclick = (element) => {
  chrome.extension.getBackgroundPage().console.log('Loging button is clicked after!');
  chrome.tabs.query({active: true, currentWindow: true}, (tabsMain) => {
    chrome.tabs.create({url: 'https://www.google.com', active: true}, (tabs) => {
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabsMain[0].id);
      chrome.extension.getBackgroundPage().console.log('New tab created!!', tabs[0].id);      
    })
    // chrome.tabs.update(tabsMain[0].id, { highlighted: true }, () => {});
  });
};
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
},{}]},{},[1]);
