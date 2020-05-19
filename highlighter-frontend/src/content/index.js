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