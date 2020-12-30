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
