(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Get element from xPath stored before
const getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/**
 * Delete span element after deleting highlight
 */
const eliminateSpan = (spanElement, highlightid) => {
  // console.log("Span: ", spanElement.innerHTML, spanElement.dataset.highlightid, spanElement.dataset.highlight, highlightid);
  let parent = spanElement.parentNode;
  console.log("Child count: ", parent.childNodes.length);
  let parentHTML = '';
  parent.childNodes.forEach(element => {
    console.log("inner: ", element.data, element.innerHTML, element.tagName);
    if (element.dataset && element.dataset.highlight && element.dataset.highlightid == highlightid) {
      console.log("IN HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
      parentHTML += element.innerHTML;
    } else if (element.tagName != undefined) {
      let tempEle = element.cloneNode(true);
      let tempDiv = document.createElement('div');
      tempDiv.appendChild(tempEle);
      parentHTML += element.innerHTML;
    } else {
      parentHTML += element.data;
    }
  });
  console.log("Parent html: ", parentHTML);
  parent.innerHTML = parentHTML;
}

/**
 * Method to eliminate delete dialog box above a highlight
 */
const eliminateDelete = (de, d, element) => {
  de.remove();
  d.remove();
  element.style.border = '0px';
}

/**
 * Method to do something when highlighted text is clicked!
 */
const highlightClicked = (element) => {
  console.log(typeof element, element.style);
  element.style.border = '1px solid #111111';
  element.style.cursor = 'pointer';
  var rect = element.getBoundingClientRect();
  var bodyRect = document.body.getBoundingClientRect();
  console.log(rect.top, rect.right, rect.bottom, rect.left);
  console.log(rect.top - bodyRect.top); 
  console.log("Highlight clicked!");

  var d = document.createElement('div');
  d.style.width = '70px';
  d.style.height = '35px';
  d.style.backgroundColor = 'black';
  d.style.position = 'fixed';
  d.style.left = (rect.left)+'px';
  d.style.top = (rect.top-51)+'px';
  d.style.display = 'flex';
  d.style.alignItems = 'center';
  d.style.justifyContent = 'center';
  d.style.zIndex = 10;
  d.style.borderWidth = '2px';
  d.style.borderRadius = '5px';
  document.body.appendChild(d);

  // Delete button inside d
  let deleteButton = document.createElement('button');
  deleteButton.id = 'deleteHighlight';
  deleteButton.style.height = '60%';
  deleteButton.style.width = 'auto';
  deleteButton.style.backgroundColor = '#ffff4d';
  deleteButton.style.borderRadius = '5px';
  deleteButton.style.color = '#000000';
  deleteButton.style.fontFamily = 'monospace';
  deleteButton.onmouseover = () => {
    deleteButton.style.color = 'white';
    deleteButton.style.backgroundColor = 'black';
  }
  deleteButton.onmouseout = () => {
    deleteButton.style.color = '#000000';
    deleteButton.style.backgroundColor = '#ffff4d';
  }
  deleteButton.innerHTML = 'Delete?';


  var de = document.createElement('div');
  de.style.width = '0px';
  de.style.height = '0px';
  de.style.position = 'fixed';
  de.style.left = (rect.left)+'px';
  de.style.top = (rect.top-21)+'px';
  de.style.borderLeft = '10px solid transparent';
  de.style.borderRight = '10px solid transparent';
  de.style.borderTop = '20px solid black';
  document.body.appendChild(de);

  document.addEventListener('scroll',(event) => {
    eliminateDelete(de, d, element);
  });

  document.addEventListener('mousedown',(event) => {
    if (event.target != deleteButton) {
      eliminateDelete(de, d, element);
    }
  });

  document.addEventListener('keydown',(event) => {
    eliminateDelete(de, d, element);
  });

  deleteButton.onclick = () => {
    chrome.runtime.sendMessage({'message':'deleteHighlight', 'highlighterid': element.dataset.highlightid}, (response) => {
      eliminateDelete(de, d, element);
      eliminateSpan(element, element.dataset.highlightid);
    });
  }
  d.appendChild(deleteButton);
}
/**
 * This method does the work of actually highlighting selected text and changing it's color
 */
const highlight = (path, selectedText, highlightid = undefined) => {
  let element = getElementByXpath(path);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  console.log('Index::', index);
  if (index >= 0) {
    let spanString = innerContent.substring(index,index+selectedText.length);
    let spanElement = document.createElement('span');
    spanElement.innerHTML = spanString;
    spanElement.style.backgroundColor = 'yellow';
    spanElement.dataset.highlight = true;
    spanElement.dataset.highlightid = highlightid;

    let wrapper = document.createElement('div');
    wrapper.appendChild(spanElement);

    innerContent = innerContent.substring(0,index) + wrapper.innerHTML + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;
    element.childNodes.forEach(element => {
      if (element.dataset && element.dataset.highlight) {
        element.onclick = () => {highlightClicked(element)};
      }
    });
  }
}

module.exports = {highlight};

},{}],2:[function(require,module,exports){
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

},{"../afterHighlight/highlight.js":1}],3:[function(require,module,exports){
/**
 * What are content scripts??
 * A content script is “a JavaScript file that runs in the context of web pages.” 
 * This means that a content script can interact with web pages that the browser visits.
 * Whenever I want to interact with the web page content scripts are used.
 */
const beforeHighlight = require('./beforeHighlight/highlight.js');
const afterHighlight = require('./afterHighlight/highlight.js');

let flag = 0;
let isDivThere = false;
console.log("I am here");

/**
 * This listener is used when user stops dragging the mouse and mouse is up
 */
document.addEventListener('mouseup', (event) =>
{ 
  // Get selection which user just selected
  let sel = window.getSelection().toString();
  let sel2 = window.getSelection();
  let selectedHTML;

  // Rangecount is used to check whether user selected anything or not.
  console.log("My rangecount is eee: ", sel2.rangeCount);
  if (sel2.rangeCount) {
      // Creating temporary div and putting selected html as innerHTML of that div
      let container = document.createElement("div");
      container.id = 'temp_div_html';
      for (let i = 0, len = sel2.rangeCount; i < len; ++i) {
          container.appendChild(sel2.getRangeAt(i).cloneContents());
      }
      selectedHTML = container.innerHTML;
      console.log('I want HTML',selectedHTML)      
  }
  
  /**To check if selected text is overlapping multiple DOM elements and other conditions like if "Highlight Me!"..
   * div is already there
  */
  if (flag === 1 && sel && sel.length > 0 && !isDivThere && 
    !(beforeHighlight.extraTerminatingConditions(event.path && event.path.length > 0 ? event.path[0] : {}, selectedHTML))) {
    
    // Get xPath of the element so that it can be identified later on
    let xPath = beforeHighlight.getPathInitial(event);
    
    // Preparing a div so that it can be displayed as "Highlight Me!"
    let decisionDiv = document.createElement("DIV");
    decisionDiv = getDivConfiguration(decisionDiv, event);
    document.body.appendChild(decisionDiv);
    isDivThere = true;
    beforeHighlight.onHighlightClick(decisionDiv, xPath, selectedHTML);
  }
});


/** This listener is used when user clicks on any other part of the web page so that I can delete already popped
 * up div which says "Highlight Me!"
 * */ 
document.addEventListener('mousedown', async (event) =>
{    
  // await checkPopup();
  flag = 0;
  if (isDivThere && event.target && event.target.id != 'highlightme') {
    document.getElementById('decision-popup').remove();
    isDivThere = false;
  }
});

/** A listener to detect the drag of a mouse */
document.addEventListener('mousemove', (event) =>
{
  flag = 1;
});

const getDivConfiguration = (object, event) => {
  let style = {
    position: "absolute",
    left: `${event.pageX}px`,
    top: `${event.pageY}px`,
    zIndex: 10,
    height: '60px',
    width: '130px',
    backgroundColor: '#000000',
    borderColor: '#ff0000' ,
    borderWidth: '2px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
  object.id = 'decision-popup';
  for (var key in object.style) {
    if (style.hasOwnProperty(key)) {
      object.style[key] = style[key];
    }
  };
  object.innerHTML = `<button 
  id=highlightme 
  style='height:60%;
         width:auto;
         background-color:#ffff4d;
         border-radius:5px;
         color:#000000;
         font-family:monospace;'
  onMouseOver="this.style.color='white';
               this.style.backgroundColor='black'"
  onMouseOut="this.style.color='#000000';
               this.style.backgroundColor='#ffff4d'">Highlight Me!</button>`;
  return object;
};


},{"./afterHighlight/highlight.js":1,"./beforeHighlight/highlight.js":2}]},{},[3]);
