// This file is used to access the chrome extension popup
// All the html elements being accessed here are from popup.html
// chrome.extension.getBackgroundPage() can be used to get access of current page's console log
// Ex: chrome.extension.getBackgroundPage().console.log()
const beforeHighlight_popup = require('./beforeHighlight_popup/highlight.js');
const afterHighlight_popup = require('./afterHighlight_popup/highlight.js');
const beforeHighlight_background = require('../background/beforeHighlight/highlight.js');
var userDetails, scrollingUL, loaderDiv;
var anchorHighlight;
var host = 'http://127.0.0.1:3000';
var to_include = 0;

/**
 * Method to map scrolling with pagination on get highlights API
 */
const scrolled = async () => {
    // //visible height + pixel scrolled = total height
    // await chrome.extension.getBackgroundPage().console.log('Scrolling');
    // await chrome.extension.getBackgroundPage().console.log(o.offsetHeight, o.scrollTop, o.scrollHeight);
    // if(o.offsetHeight + o.scrollTop == o.scrollHeight)
    // {
    //     await chrome.extension.getBackgroundPage().console.log('I am at the ends');
    //     alert("End");
    // }
    
}

/**
 * General method to handle error 
 */
const handleError = () => {
  return new Promise (
    async (resolve, reject) => {
      console.log('Faced an error');
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
 * This mehtod is used to populate extension popup with user's highlights
 */

const populateHighlights = (userInfo,mainUL) => {
  return new Promise (
    async (resolve, reject) => {
      chrome.storage.sync.get('page', async (data) => {
        // await chrome.extension.getBackgroundPage().console.log('Populating: ', to_include);
        try {
          var page = data.page;
          if (page == undefined) {
            page = 1;
            await chrome.storage.sync.set( {page: 1} , () => {});          
          }
          console.log('My page:: ', page);

          chrome.storage.sync.get('openPopup', async (data) => {
            try {
              var state = data.openPopup;
              console.log('My state:: ', state);
              let highlights = await afterHighlight_popup.useAPI('fetchHighlights'
                          ,'GET', `${host}/highlights?`, {
                            userid: userInfo.userData.id, 
                            type: 'popup',
                            page, 
                            to_include
                          }, userInfo.userData.accesstoken); 
              if (highlights.data.length == 0 && page == 1) {
                loaderDiv.style.display = 'none';
                document.getElementById('no_highlight_div').style.display = 'flex';
              } else {
                await chrome.storage.sync.set( {page: page+1} , () => {});
                console.log('My highlights:: ', highlights);

                highlights.data.forEach(eachHighlight => {
                  let mainAnchor = document.createElement('a');
                  mainAnchor.classList.add('no_decoration');
                  mainAnchor.href = eachHighlight.url;
                  mainAnchor.onclick = () => {afterHighlight_popup.urlFromHighlight(eachHighlight.url)};

                  let UL = document.createElement('ul');
                  UL.classList.add('each_highlight');

                  let li1 = document.createElement('li');
                  li1.innerHTML = eachHighlight.selected_html;
                  
                  let anchor = document.createElement('a');
                  anchor.href = eachHighlight.url;
                  anchor.innerHTML = eachHighlight.url_title;
                  anchor.onclick = () => {afterHighlight_popup.urlFromHighlight(eachHighlight.url)};

                  let li2 = document.createElement('li');

                  li2.appendChild(anchor);
                  UL.appendChild(li1);
                  UL.appendChild(li2);
                  [...UL.children].forEach((each) => {
                    each.style.backgroundColor = eachHighlight.highlight_color;
                  });

                  mainAnchor.appendChild(UL);
                  mainUL.appendChild(mainAnchor);
                 
                  let iElement = document.createElement('i');
                  iElement.classList.add('delete_sign');
                  iElement.classList.add('fas');
                  iElement.classList.add('fa-trash-alt');
                  iElement.onclick = () => {modalOperation(mainAnchor, iElement, eachHighlight.id, userInfo)};
                  mainUL.appendChild(iElement);
                });
                mainUL.style.display = 'inline-block';
                loaderDiv.style.display = 'none';
              }
              return resolve();
            } catch(error) {
              await handleError();
              return reject(error);
            }
          });
        }
        catch(error) {
          await handleError();
        }
      });
    }
  )
}



/**
 * Method to set that popup was open
 */
const setOpenPage = () => {
  return new Promise (
    async (resolve, reject) => {
      console.log('I am in setopen');
      await chrome.storage.sync.set({ openPopup: true });
      await chrome.storage.sync.set({ page: 1 });
      return resolve();
    }
  )
}
$(document).ready(async () => {
  // await chrome.extension.getBackgroundPage().console.log('I am in jQuery');
  $('#highlight_list').bind('scroll', async () => {
      // await chrome.extension.getBackgroundPage().console.log('Scrolling using jQuery');
      // await chrome.extension.getBackgroundPage().console.log($('#highlight_list').scrollTop(), $('#highlight_list').innerHeight(), $('#highlight_list')[0].scrollHeight);
      if($('#highlight_list').scrollTop() + $('#highlight_list').innerHeight()>=($('#highlight_list')[0].scrollHeight-0.4))
      {
        // await chrome.extension.getBackgroundPage().console.log("I am at the end", userDetails);
        if (userDetails != undefined && scrollingUL != undefined) {
          await populateHighlights(userDetails, scrollingUL);
        }
      }
    })
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    afterHighlight_popup.to_include = 0;
    await setOpenPage();


    let beforeLogin = document.getElementById('before_login');
    let afterLogin = document.getElementById('after_login');  

    // A method to check whether user is logged in or not
    let isUserLoggedIn = await beforeHighlight_background.userLoggedIn();
    
    if (isUserLoggedIn.isLoggedIn) {
      try {
        beforeHighlight_popup.setCurrentTab();
        scrolled();
        console.log('I am already logged IN');
        // Make loader visible
        loaderDiv = document.getElementById('loader_div');
        loaderDiv.style.display = 'inline-block';
        scrollingUL = document.getElementById('highlight_list');
        scrollingUL.style.display = 'none';

        // Make "afterLogin" part visible from popup.html if user is already logged in
        afterLogin.style.display = 'block';

        
        // scrollingUL.onscroll = scrolled(scrollingUL);
        const logoutButton = document.getElementById('logout_button');
        const spacesButton = document.getElementById('spaces_button');

        // Set user details
        userDetails = isUserLoggedIn;

        // Set event on logout button
        logoutButton.onclick = (element) => {
          beforeHighlight_popup.logout();
          beforeHighlight_popup.hideShowLogin('logout', {beforeLogin, afterLogin});
        };

        // Open /spaces for particular user when spaces button is clicked
        spacesButton.onclick = () => {
          if (userDetails.isLoggedIn) {
            beforeHighlight_popup.openSpaces({ usertoken: userDetails.userData.accesstoken });
          }
        }
        // Populate highlights for user
        await populateHighlights(isUserLoggedIn,scrollingUL);
      } catch(error) {
        await handleError();
      }
    } else {
      try {
        await chrome.extension.getBackgroundPage().console.log('I am NOT already logged IN', beforeLogin.style.display);    
      
        // Make "beforeLogin" part visible from popup.html if user is NOT logged in
        beforeLogin.style.display = 'block';

        await beforeHighlight_popup.registerLoginSignup();
      } catch(error) {
        await handleError();
      }
    }
  } catch(error) {
    // await chrome.extension.getBackgroundPage().console.log('Faced an error on top level');
  }
});

const modalOperation = (mainAnchor, iElement, highlighterid,userInfo) => {
  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName('close')[0];

  var yes_delete = document.getElementById('yes_delete');
  var no_delete = document.getElementById('no_delete');

  // When the user clicks the delete button, open the modal 
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = () => {
    modal.style.display = 'none';
  };

  yes_delete.onclick = async () => {
    try {
      to_include += 1;
      await chrome.extension.getBackgroundPage().console.log('Yes clicked: ', to_include);
      await afterHighlight_popup.useAPI('deleteHighlight'
                          ,'DELETE', `${host}/highlights/`, {highlighterid, userid: userInfo.userData.id}, userInfo.userData.accesstoken);
      // Convert delete sign i element to jquery object to use remove object!
      var jqueryObj = $(iElement);
      jqueryObj.remove();

      mainAnchor.innerHTML = '';
      modal.style.display = 'none';
    } catch(error) {
      await handleError();
    }
  };

  no_delete.onclick = () => {
    modal.style.display = 'none';
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
};

module.exports = {handleError};