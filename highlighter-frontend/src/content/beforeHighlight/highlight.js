let siblingNodeName;
const getHighlightInfo = (path) => {
  // let path = event.path;
  let querySelectorString = '';
  let tillBody = false;
  let elementTopOrder, elementLeftOrder;
  let pathArray = [];
  let isID = false;
  console.log('I want to see path:', path);
  for (i=0;i<path.length;i++) {
    console.log('Every path element:', path[i].nodeName);
    if(i === 0) {
      if (path[i].id) {
        console.log('I have ID');
        isID = true;
      } else {
        // console.log('I dont have ID');
        siblingNodeName = path[i].nodeName;  
        let siblings = getSiblings(path[i], exampleFilter);        
        console.log('My siblings::', siblings);
        ({elementTopOrder, elementLeftOrder} = getTopLeftOrder(path[i].offsetTop, path[i].offsetLeft, siblings));
        console.log('OffsetTop AND offsetLeft:', elementTopOrder, elementLeftOrder);
        // console.log('First element:', path[i]);
      }
    }

    // console.log('Each node name:', path[i].nodeName);
    if (path[i].nodeName === 'BODY') {
      tillBody = true;
    }

    if (!tillBody) {
      let classOrId = path[i].id ? `#${path[i].id}` : (path[i].className ? `.${path[i].className}` : '');
      let intermediate = `${path[i].nodeName}${classOrId}`;
      // querySelectorString += `${intermediate} `;
      pathArray.push(intermediate);
    };
  }
  pathArray = pathArray.reverse();
  pathArray = pathArray.filter(word => (word != undefined || word != null));
  console.log('Path array::', pathArray);
  querySelectorString = pathArray.join(' > ').trim();
  console.log('Final querySelector:', elementTopOrder, elementLeftOrder, querySelectorString);
  // querySelectorString += ':nth-of-type(1)';
  let currentElement = isID ? document.querySelectorAll(querySelectorString)[0] : document.querySelectorAll(querySelectorString)[elementTopOrder];
  console.log('Current element::', currentElement);
  return;
}

//All the custom conditions when Highlight should not work
const extraTerminatingConditions = (path) => {
  if (path.nodeName === 'A' || path.nodeName === undefined) {
    return true;
  }
  return false;
}

//Get all siblings when ID is not provided
const getSiblings = (el, filter) => {
  var siblings = [];
  console.log('Parent child::', el.parentNode.nodeName);
  el = el.parentNode.firstChild;
  do { if (!filter || filter(el)) siblings.push(el); } while (el = el.nextElementSibling);
  // let siblings = Array.from(document.getElementsByTagName(siblingNodeName));
  return siblings;
}

const exampleFilter = (el, nodeName) => {
  return el.nodeName.toLowerCase() == siblingNodeName.toLowerCase();
}

//Get top and left ordering of siblings
const getTopLeftOrder = (elementTop, elementLeft, siblings) => {
  let result = {};
  console.log('Siblings:', siblings);
  console.log('Element top and left::', elementTop, elementLeft);
  
  //Get top ordering
  siblings.sort((a, b) => (a.offsetTop > b.offsetTop) ? 1 : -1);        
  siblings.every((element, index) => {
    if (element.offsetTop === elementTop) {
      result.elementTopOrder = index
      console.log('Sibling offset top INSIDE:', element.offsetTop, index);
      console.log('HTML Collection::', )
      return false;        
    }
    console.log('Sibling offset top OUTSIDE:', element.offsetTop, index);              
    return true;
  });

  //Get left ordering
  siblings.sort((a, b) => (a.offsetLeft > b.offsetLeft) ? 1 : -1);        
  siblings.every((element, index) => {
    if (element.offsetLeft === elementLeft) {
      result.elementLeftOrder = index
      console.log('Sibling offset left INSIDE:', element.offsetLeft, index);
      return false;              
    }
    console.log('Sibling offset left OUTSIDE:', element.offsetLeft, index); 
    return true;                     
  });
  return result;
}

module.exports = {getHighlightInfo, extraTerminatingConditions};
