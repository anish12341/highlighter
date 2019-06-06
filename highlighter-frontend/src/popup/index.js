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