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
      if (objective == 'fetchHighlights' || objective == 'fetchSpaces') {
        if (method == 'GET') {
          let query = Object.keys(data)
             .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
             .join('&');
          url = url + query;
          console.log("Query: ", query);
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

const copySelectedHtml = ({ parentUL, selectedHtmlElement }) => {
  parentUL.appendChild(selectedHtmlElement);
  selectedHtmlElement.select();
  document.execCommand("copy");
  parentUL.removeChild(selectedHtmlElement);
  $("#copy_toast_div").fadeIn(1800);
  $("#copy_toast_div").fadeOut(1800);

  // selectedHtmlElement.select();
  // // selectedHtmlElement.setSelectionRange(0, 99999);
  // document.execCommand('copy');
  console.log("Copied!!");
}

module.exports = {urlFromHighlight, useAPI, handleError, copySelectedHtml};