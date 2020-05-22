const afterHighlight = require('../afterHighlight/highlight.js');

//All the custom conditions when Highlight should not work
const extraTerminatingConditions = (path, selectedText) => {
  console.log('My selected Text::', selectedText);
  if (path.nodeName === 'A' 
  || path.nodeName === undefined 
  || (getMultipleElements(selectedText, /^<[\w]+>/)
  && getMultipleElements(selectedText, /<[/][\w]+>$/))) {
    return true;
  }
  return false;
}

//Create xPath
const getPathInitial = (event) => {
  if (event===undefined) event= window.event;                     // IE hack
  let target= 'target' in event? event.target : event.srcElement; // another IE hack

  let root= document.compatMode==='CSS1Compat'? document.documentElement : document.body;
  let mxy= [event.clientX+root.scrollLeft, event.clientY+root.scrollTop];

  let path= getPathTo(target);
  let message =`You clicked the element ${path}`;
  console.log('New message::', message);  
  return path;
}

/**
 * A recursive function to get path to the element
 */
const getPathTo = (element) => {
  if (element.id!=='')
      return "//*[@id='"+element.id+"']";
  
  if (element===document.body)
      return element.tagName.toLowerCase();

  let ix= 0;
  let siblings= element.parentNode.childNodes;
  for (let i= 0; i<siblings.length; i++) {
      let sibling= siblings[i];
      
      if (sibling===element) return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
      
      if (sibling.nodeType===1 && sibling.tagName === element.tagName) {
          ix++;
      }
  }
}

// Check if selected text is overlapping multiple elements in DOM
const getMultipleElements = (string, regexp) => {
  return regexp.test(string);
};

/**
 * This method send the selected HTML to background script. This is done by setting up a click listener
 * on the newly created div
 */
const onHighlightClick = (decisionDiv, xPath, selectedHTML) => {
  decisionDiv.addEventListener('click', (event) => {
    chrome.runtime.sendMessage({'message':'setText','data': selectedHTML, xpath: xPath}, (response) => {
      console.log("Response from background scrsdsipt: ", response);
      let highlightid;
      if (response != undefined) {
        highlightid = response.data.id;
      }
      afterHighlight.highlight(xPath, selectedHTML, highlightid);
    });    
  })
};

module.exports = {extraTerminatingConditions, getPathInitial, onHighlightClick};
