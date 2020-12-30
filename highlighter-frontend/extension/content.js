(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Get element from xPath stored before
const getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

/**
 * Transfer the whole HTML using temporary div element
 */
const transferHTML = (element) => {
  let tempEle = element.cloneNode(true);
  let tempDiv = document.createElement('div');
  tempDiv.appendChild(tempEle);
  // console.log("Temp dev: ", tinnerHTML);
  return tempDiv.innerHTML;
};

/**
 * Register onclick for remaining highlights in the target after deleting
 */
const reregisterOnClick = (parentNode) => {
  parentNode.childNodes.forEach(each => {
    if (each.dataset && each.dataset.highlight) {
      each.onclick = () => {highlightClicked(each)};
    }
  })
}

/**
 * Delete span element after deleting highlight
 */
const eliminateSpan = (spanElement, highlightid) => {
  // console.log("Span: ", spanElement.innerHTML, spanElement.dataset.highlightid, spanElement.dataset.highlight, highlightid);
  let parent = spanElement.parentNode;
  let parentHTML = '';
  parent.childNodes.forEach(element => {
    if (element.dataset && element.dataset.highlight) {
      if (element.dataset.highlightid == highlightid) {
        parentHTML += element.innerHTML;
      } else {
        parentHTML += transferHTML(element);
        element.onclick = () => highlightClicked(element);
      }
    } else if (element.tagName != undefined) {
      parentHTML += transferHTML(element);
    } else {
      parentHTML += element.data;
    }
  });
  parent.innerHTML = parentHTML;
  reregisterOnClick(parent);
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
const highlightClicked = (element, deleteButtonColor = '#ffff4d') => {
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
  deleteButton.style.height = '25px';
  deleteButton.style.width = '60px';
  deleteButton.style.backgroundColor = deleteButtonColor;
  deleteButton.style.borderRadius = '5px';
  deleteButton.style.color = '#000000';
  deleteButton.style.fontFamily = 'monospace';
  deleteButton.style.fontSize = '11px';
  deleteButton.style.cursor = 'pointer';
  deleteButton.onmouseover = () => {
    deleteButton.style.color = 'white';
    deleteButton.style.backgroundColor = 'black';
  }
  deleteButton.onmouseout = () => {
    deleteButton.style.color = '#000000';
    deleteButton.style.backgroundColor = deleteButtonColor;
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
    chrome.runtime.sendMessage({'message':'getUser'}, (user) => {
      chrome.runtime.sendMessage({'message':'deleteHighlight', 'highlighterid': element.dataset.highlightid, user}, (response) => {
        eliminateDelete(de, d, element);
        eliminateSpan(element, element.dataset.highlightid);
      });
    });
  }
  d.appendChild(deleteButton);
}
/**
 * This method does the work of actually highlighting selected text and changing it's color
 */
const highlight = (path, selectedText, highlightid = undefined, highlightColor = "#ffff4d") => {
  let element = getElementByXpath(path);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  if (index >= 0) {
    let spanString = innerContent.substring(index,index+selectedText.length);
    let spanElement = document.createElement('span');
    spanElement.innerHTML = spanString;
    spanElement.style.backgroundColor = highlightColor;
    spanElement.style.cursor = 'pointer';
    spanElement.dataset.highlight = true;
    spanElement.dataset.highlightid = highlightid;

    let wrapper = document.createElement('div');
    // wrapper.id = "highlight_div";
    wrapper.appendChild(spanElement);

    innerContent = innerContent.substring(0,index) + wrapper.innerHTML + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;
    element.childNodes.forEach(element => {
      if (element.dataset && element.dataset.highlight) {
        element.onclick = () => {
          highlightClicked(element, element.style.backgroundColor)
        };
      }
    });
  }
}

module.exports = {highlight, getElementByXpath};

},{}],2:[function(require,module,exports){
const afterHighlight = require('../afterHighlight/highlight.js');


//All the custom conditions when Highlight should not work
const extraTerminatingConditions = (path, selectedText) => {
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
const onHighlightClick = ({ decisionDiv, xPath, selectedHTML, colorPickerValue, highlightName, tempSpanElement }) => {
  decisionDiv.addEventListener('click', async (event) => {
    chrome.storage.sync.get("currentSpace", ({ currentSpace }) => {
      currentSpace = currentSpace || -1;
      chrome.runtime.sendMessage({
        'message':'setText',
        'data': selectedHTML, 
        xpath: xPath, 
        highlightColor: colorPickerValue,
        currentSpace,
        highlightName
      }, (response) => {
        let highlightid;
        if (response !== undefined) {
          highlightid = response.data.id;
        }
        decisionDiv.remove();
        resetTempSpan(tempSpanElement);
        afterHighlight.highlight(xPath, selectedHTML, highlightid, colorPickerValue);
      });
    });
  })
};

const createColorPaletDiv = (color) => {
  const colorPaletDiv = document.createElement("div");
  Object.assign(colorPaletDiv.style, {
    height: '100%',
    width: '100%',
    backgroundColor: color
  });
  return colorPaletDiv;
}

const tempHighlight = ({path, selectedText, highlightColor = "#ffff4d"}) => {
  let element = afterHighlight.getElementByXpath(path);
  let innerContent = element.innerHTML;
  innerContent = innerContent.replace(/\n/g, "");
  innerContent = innerContent.replace(/\s\s/g,' ');
  selectedText = selectedText.replace(/\n/g, "");
  selectedText = selectedText.replace(/\s\s/g,' ');
  let index = innerContent.indexOf(selectedText);
  if (index >= 0) {
    let spanString = innerContent.substring(index,index+selectedText.length);
    let spanElement = document.createElement('span');
    spanElement.id = 'temp_highlighter_span';
    spanElement.innerHTML = spanString;
    spanElement.style.backgroundColor = highlightColor;

    let wrapper = document.createElement('div');
    wrapper.id = 'temp_wrapper_div';
    wrapper.appendChild(spanElement);

    innerContent = innerContent.substring(0,index) + wrapper.innerHTML + innerContent.substring(index + selectedText.length);
    element.innerHTML = innerContent;

    return { spanElement };
  }
}

const resetTempSpan = (spanElement) => {
  const spanParent = spanElement.parentNode;
  const spanParentInnerHTML = spanParent.innerHTML;

  const tempDiv = document.createElement('div');
  tempDiv.appendChild(spanElement);

  const spanIndex = spanParentInnerHTML.indexOf(tempDiv.innerHTML);
  spanParent.innerHTML = spanParentInnerHTML.substring(0, spanIndex) + spanElement.innerHTML + spanParentInnerHTML.substring(spanIndex + tempDiv.innerHTML.length);
}

module.exports = {
  extraTerminatingConditions,
  getPathInitial,
  onHighlightClick,
  createColorPaletDiv,
  tempHighlight,
  resetTempSpan
};

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
let colorPickerValue = "#ffff4d"
let tempSpanElement;

/**
 * When page loads get all the highlights for that page
 */
window.addEventListener('load',(event) => {
  chrome.runtime.sendMessage({'message':'getUser'}, (userDetails) => {
    if (userDetails.isLoggedIn) {
      chrome.runtime.sendMessage({'message':'getHighlight', 'userid': userDetails.userData.id, 'accesstoken': userDetails.userData.accesstoken}, (highlights) => {
        if (highlights.success) {
          highlights.data.forEach(each => {
            console.log(each);
            afterHighlight.highlight(each.xpath, each.selected_html, each.id, each.highlight_color, each.highlight_color);
          });
        }
      });
    }
  });
})

/**
 * Check whether the selected element contains another highlight
 */
const anotherHighlight = (selectedHTML) => {
  let element = document.createElement('div');
  element.innerHTML = selectedHTML;
  for (let i = 0; i < element.childNodes.length; i++) {
    console.log(element.childNodes[i].dataset);
    if (element.childNodes[i].dataset && element.childNodes[i].dataset.highlight) {
      return false;
    }
  }
  return true;
};

/**
 * This listener is used when user stops dragging the mouse and mouse is up
 */
document.addEventListener('mouseup', (event) =>
{ 
  if (event.target.id !== "color_picker") {
    // Get selection which user just selected
    let sel = window.getSelection().toString();
    let sel2 = window.getSelection();
    let selectedHTML;

    // Rangecount is used to check whether user selected anything or not.
    if (sel2.rangeCount) {
        // Creating temporary div and putting selected html as innerHTML of that div
        let container = document.createElement("div");
        container.id = 'temp_div_html';
        for (let i = 0, len = sel2.rangeCount; i < len; ++i) {
            container.appendChild(sel2.getRangeAt(i).cloneContents());
        }
        selectedHTML = container.innerHTML;
    }
    
    /**To check if selected text is overlapping multiple DOM elements and other conditions like if "Highlight Me!"..
     * div is already there
    */
    if (flag === 1 && sel && sel.length > 0 && !isDivThere && 
      !(beforeHighlight.extraTerminatingConditions(event.path && event.path.length > 0 ? event.path[0] : {}, selectedHTML))) {
      
      // Get xPath of the element so that it can be identified later on
      let xPath = beforeHighlight.getPathInitial(event);
      
      // Check whether the element contains another highlight
      if (anotherHighlight(selectedHTML)) {
        // Preparing a div so that it can be displayed as "Highlight Me!"
        let divSkeleton = document.createElement("DIV");
        const {
          object: decisionDiv,
          inputName,
          triangleDiv,
          emptyMessageDiv
        } = getDivConfiguration(divSkeleton, event);
        document.body.appendChild(decisionDiv);
        isDivThere = true;

        beforeHighlight.tempHighlight({ path: xPath, selectedText: selectedHTML });
        tempSpanElement = document.getElementById("temp_highlighter_span");

        const highlightButton = decisionDiv.querySelector("#highlightme");
        highlightButton.onclick = (() => {
          if (inputName.value === '') {
            fadeIn(triangleDiv, 300);
            fadeIn(emptyMessageDiv, 300);
          } else {
            beforeHighlight.onHighlightClick({ 
              decisionDiv, 
              xPath,
              selectedHTML, 
              colorPickerValue,
              highlightName: inputName.value,
              tempSpanElement
            });
          }
        });

        inputName.addEventListener('keydown', (e) => {
          if (e.target.value === '') {
            fadeIn(triangleDiv, 300);
            fadeIn(emptyMessageDiv, 300);
          } else {
            triangleDiv.style.display = 'none';
            emptyMessageDiv.style.display = 'none';
          }
        });
      }
    }
  }
});


/** This listener is used when user clicks on any other part of the web page so that I can delete already popped
 * up div which says "Highlight Me!"
 * */ 
document.addEventListener('mousedown', async (event) =>
{    
  // await checkPopup();
  flag = 0;
  if (isDivThere && event.target && 
    event.target.id != 'highlightme' && event.target.id != 'color_picker'
    && event.target.id != 'input_highlight_name' && event.target.id != 'input_highlight_name_div') {
    let highlightDiv = document.getElementById('decision-popup');
    if (highlightDiv != undefined) {
      highlightDiv.remove();
      if (tempSpanElement) {
        beforeHighlight.resetTempSpan(tempSpanElement);
      }
    }
    isDivThere = false;
  }
});

/** A listener to detect the drag of a mouse */
document.addEventListener('mousemove', (event) =>
{
  flag = 1;
});

const fadeIn = (el, time) => {
  el.style.display = 'block';
  el.style.opacity = 0;

  var last = +new Date();
  var tick = function() {
    el.style.opacity = +el.style.opacity + (new Date() - last) / time;
    last = +new Date();

    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };

  tick();
}

const createHighlightButton = () => {
  const highlightButton = document.createElement("button");
  highlightButton.id = "highlightme";
  Object.assign(highlightButton.style, {
    height:"30px",
    width:"100px",
    backgroundColor:"#ffff4d",
    borderRadius:"5px",
    color:"#000000",
    fontFamily:"monospace",
    fontSize: "9px",
    fontWeight: "bold",
    marginLeft: '10px',
    cursor: "pointer"
  });

  highlightButton.onmouseover = function() {
    this.style.color = "white";
    this.style.backgroundColor = "black";
  }

  highlightButton.onmouseout = function() {
    this.style.color = "#000000";
    this.style.backgroundColor = colorPickerValue;
  }
  highlightButton.innerHTML = "Highlight Me!";
  return highlightButton;
}

const createColorDropbox = ({ highlightButton }) => {
  const colorDropbox = document.createElement("select");
  colorDropbox.id = "color_picker";
  Object.assign(colorDropbox.style, {
    marginLeft: '10px',
    marginRight: '10px',
    padding: '0',
    cursor: 'pointer',
    width: '70px',
    height: '30px',
    backgroundColor: 'white',
    fontFamily: 'monospace',
    fontSize: '11.5px',
    borderRadius: '5px'
  });

  const yellowOption = document.createElement("option");
  yellowOption.innerHTML = "yellow";
  yellowOption.value = "#ffff4d";
  yellowOption.checked = true;

  const purpleOption = document.createElement("option");
  purpleOption.innerHTML = "purple";
  purpleOption.value = "#cd4dff";

  const neonOption = document.createElement("option");
  neonOption.innerHTML = "Neon";
  neonOption.value = "#65ff4d";

  colorDropbox.append(yellowOption);
  [yellowOption, purpleOption, neonOption].forEach((eachOption) => {
    colorDropbox.append(eachOption);
  });

  colorDropbox.onchange = function() {
    colorPickerValue = this.value;
    highlightButton.style.backgroundColor = this.value;
    if (tempSpanElement) {
      tempSpanElement.style.backgroundColor = this.value;
    }
  }

  return colorDropbox;
}

const createHighlightNameInput = () => {
  const inputNameDiv = document.createElement('div');
  inputNameDiv.id = 'input_highlight_name_div';
  Object.assign(inputNameDiv.style, {
    width: '120px',
    height: '30px',
    marginLeft: '10px',
    fontSize: '0'
  });

  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.id = 'input_highlight_name';
  inputName.placeholder = 'Give name!';
  inputName.maxLength = '20';
  Object.assign(inputName.style, {
    width: 'inherit',
    height: 'inherit',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '15px'
  });

  inputNameDiv.appendChild(inputName);
  return {inputNameDiv, inputName};
}

const createNameMessageDiv = () => {
  const triangleDiv = document.createElement('div');
  triangleDiv.id = "triangle_div";
  Object.assign(triangleDiv.style, {
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '13px solid #f9fad4',
    position: 'absolute',
    top: '44px',
    left: '10px',
    display: 'none'
  });

  const emptyMessageDiv = document.createElement('div');
  emptyMessageDiv.id = "empty_message_div";
  emptyMessageDiv.innerHTML = "Name required!";
  Object.assign(emptyMessageDiv.style, {
    width: 'fit-content',
    height: '30px',
    position: 'absolute',
    borderRadius: '5px',
    top: '53px',
    left: '10px',
    backgroundColor: '#f9fad4',
    color: 'black',
    fontSize: '13px',
    paddingLeft: '4px',
    paddingRight: '4px',
    display: 'none'
  });

  return { triangleDiv, emptyMessageDiv };
}

const getDivConfiguration = (object, event) => {
  let style = {
    position: "absolute",
    left: `${event.pageX}px`,
    top: `${event.pageY}px`,
    zIndex: 10,
    height: '60px',
    width: 'auto',
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

  const {triangleDiv, emptyMessageDiv} = createNameMessageDiv();
  const {inputNameDiv, inputName} = createHighlightNameInput();
  const highlightButton = createHighlightButton();
  const colorPicker = createColorDropbox({ highlightButton });

  object.appendChild(inputNameDiv);
  object.appendChild(highlightButton);
  object.appendChild(colorPicker);
  object.appendChild(triangleDiv);
  object.appendChild(emptyMessageDiv);
  
  return {object, inputName, triangleDiv, emptyMessageDiv};
};


},{"./afterHighlight/highlight.js":1,"./beforeHighlight/highlight.js":2}]},{},[3]);
