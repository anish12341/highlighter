const beforeHighlight = require('./beforeHighlight/highlight.js');
const afterHighlight = require('./afterHighlight/highlight.js');

let flag = 0;
let isDivThere = false;
// console.log('State::', document.readyState);


document.addEventListener('mouseup', (event) =>
{ 
  let sel = window.getSelection().toString();
  // highlight('p', 'Extensions');
  let sel2 = window.getSelection();
  let selectedHTML;
  if (sel2.rangeCount) {
      let container = document.createElement("div");
      container.id = 'temp_div_html';
      for (let i = 0, len = sel2.rangeCount; i < len; ++i) {
          container.appendChild(sel2.getRangeAt(i).cloneContents());
      }
      selectedHTML = container.innerHTML;
      // let tempDivHtml = document.getElementById('temp_div_html');
      // tempDivHtml.remove();
      console.log('I want HTML',selectedHTML)      
  }
  // console.log('Inner HTML of first element:', event.path[0].innerHTML);
  // console.log('Regex replace:', event.paxth[0].innerHTML.replace())
  if (flag === 1 && sel && sel.length > 0 && !isDivThere && !(beforeHighlight.extraTerminatingConditions(event.path && event.path.length > 0 ? event.path[0] : {}, selectedHTML))) {
    console.log('Event full data::', event);
    // console.log('Whole path::', event.path);
    // console.log('Composed path::', event.composedPath());
    // Get all information regarding element which contains selected text
    // beforeHighlight.getHighlightInfo(event.path);
    let xPath = beforeHighlight.getPathInitial(event);
    // afterHighlight.highlight(xPath, selectedHTML);
    // console.log('Current element using xPath ::', currentElement, currentElement.innerHTML);
    let decisionDiv = document.createElement("DIV");
    decisionDiv = getDivConfiguration(decisionDiv, event);
    document.body.appendChild(decisionDiv);
    isDivThere = true;
    beforeHighlight.onHighlightClick(decisionDiv, xPath, selectedHTML);
    // chrome.runtime.sendMessage({'message':'setText','data': selectedHTML},function(response){})    
  }
});

document.addEventListener('mousedown', (event) =>
{    
  flag = 0;
  if (isDivThere && event.target && event.target.id != 'highlightme') {
    console.log('Deleting now');
    document.getElementById('decision-popup').remove();
    isDivThere = false;
  }
});

document.addEventListener('mousemove', (event) =>
{
  console.log("In mouse move");  
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

// const highlight = (tagName, text) => {
//   let elementArray = document.getElementsByTagName('p');
//   // console.log('Element array::', elementArray);
//   for (i=0 ; i < elementArray.length ; i++) {
//     let eachElement = elementArray.item(i);
//     let innerContent = eachElement.innerHTML;
//     innerContent = innerContent.replace(/\n/g, "");
//     innerContent = innerContent.replace(/\s\s/g,' ');
//     // console.log('Whole P::', eachElement);
//     let index = innerContent.indexOf(text);
//     // console.log('Index::', index);
//     if (index >= 0) {
//       // console.log('Matched::', eachElement);      
//       innerContent = innerContent.substring(0,index) + "<span style='background-color: yellow;'>" + innerContent.substring(index,index+text.length) + "</span>" + innerContent.substring(index + text.length);
//       eachElement.innerHTML = innerContent;
//     }
//   };
// }