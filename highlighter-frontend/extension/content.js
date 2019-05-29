(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const getHighlightInfo = () => {
  console.log('I am in here getting all the info');
  return;
}

module.exports = {getHighlightInfo};

},{}],2:[function(require,module,exports){
const beforeHighlight = require('./beforeHighlight/highlight.js');
beforeHighlight.getHighlightInfo();

let flag = 0;
let isDivThere = false;
// console.log('State::', document.readyState);


document.addEventListener('mouseup', (event) =>
{ 
  let sel = window.getSelection().toString();
  highlight('p', 'Extensions');
  // console.log('document body:', document.body.innerHTML);
  if (flag === 1 && sel && sel.length > 0 && !isDivThere) {
    // console.log('Event full data::', event);
    // console.log('Whole path::', event.path);
    // console.log('Composed path::', event.composedPath());
   
    let path = event.path;
    let querySelectorString = '';
    let tillBody = false;    
    for (i=0;i<path.length;i++) {
      if(i === 0) {
        if (path[i].id) {
          // console.log('I have ID');
        } else {
          // console.log('I dont have ID');
          let childOffsetTop = path[i].offsetTop;
          // console.log('OffsetTop:', childOffsetTop);
          // console.log('First element:', path[i]);
          let siblings = getSiblings(path[i], exampleFilter);
          // console.log('Siblings:', siblings); 
        }
      }
      // console.log('Each node name:', path[i].nodeName);
      if (path[i].nodeName === 'BODY') {
        tillBody = true;
      }
      if (!tillBody) {
        let classOrId = path[i].id ? `#${path[i].id}` : (path[i].className ? `.${path[i].className}` : '');
        let intermediate = `${path[i].nodeName}${classOrId}`;
        querySelectorString += `${intermediate} `;
      };
    }
    // console.log('Final querySelector:', querySelectorString.trim());
    let decisionDiv = document.createElement("DIV");
    decisionDiv = getDivConfiguration(decisionDiv, event);
    document.body.appendChild(decisionDiv);
    isDivThere = true;
    chrome.runtime.sendMessage({'message':'setText','data': sel},function(response){})
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
  object.innerHTML = `<button id=highlightme style='height:60%;width:auto;background-color:#ffff4d;
  border-radius:5px;color:#000000'>Highlight Me!</button>`;
  return object;
};

const exampleFilter = (el) => {
  return el.nodeName.toLowerCase() == 'p';
}

const getSiblings = (el, filter) => {
  var siblings = [];
  el = el.parentNode.firstChild;
  do { if (!filter || filter(el)) siblings.push(el); } while (el = el.nextElementSibling);
  return siblings;
}

const highlight = (tagName, text) => {
  let elementArray = document.getElementsByTagName('p');
  // console.log('Element array::', elementArray);
  for (i=0 ; i < elementArray.length ; i++) {
    let eachElement = elementArray.item(i);
    let innerContent = eachElement.innerHTML;
    innerContent = innerContent.replace(/\n/g, "");
    innerContent = innerContent.replace(/\s\s/g,' ');
    // console.log('Whole P::', eachElement);
    let index = innerContent.indexOf(text);
    // console.log('Index::', index);
    if (index >= 0) {
      // console.log('Matched::', eachElement);      
      innerContent = innerContent.substring(0,index) + "<span style='background-color: yellow;'>" + innerContent.substring(index,index+text.length) + "</span>" + innerContent.substring(index + text.length);
      eachElement.innerHTML = innerContent;
    }
  };
}
},{"./beforeHighlight/highlight.js":1}]},{},[2]);
