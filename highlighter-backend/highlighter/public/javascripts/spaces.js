let memberList = [];
let memberNames = [];
let addMemberMessageStatus = true;
let memberError, nameError, inputSpaceMembers, nameField, spaceLoader, logoutButton, notificationButton;
let mySpaceEntry, deleteHighlightCancel, deleteHighlightModal, noDeleteHighlight, yesDeleteHighlight;
let createModalCloseButton, cancelButtonCreateModal, noHighlightMessage;
let globalUserDetails;


const modalCloseFunction = (modal) => {
  modal.style.display = "none";
};

const removeMember = (memberDiv, userid, name) => {
  memberDiv.remove();
  memberList = memberList.filter((element) => {
    return true ? userid !== element : false;
  });

  memberNames = memberNames.filter((element) => {
    return true ? name !== element : false;
  });

  if (memberList.length == 0) {
    addMemberMessageStatus = true;
    $("#add_member_message").show();
  }
}

const createMemberMarkup = ({ first_name, id: userid, name }) => {
  const memberDiv = document.createElement("div");
  memberDiv.className = "each-added-member";

  const firstNameP = document.createElement("p");
  firstNameP.className = "each-added-member-name";
  firstNameP.innerHTML = name;

  const cancelSpan = document.createElement("span");
  cancelSpan.innerHTML = "&times;";
  cancelSpan.className = "remove-member";
  cancelSpan.onclick = () => { removeMember(memberDiv, userid, name) };

  memberDiv.appendChild(firstNameP);
  memberDiv.appendChild(cancelSpan);

  return memberDiv;
}
const validateEmail = (email) => {
  fetch(
    `${location.origin}/users/validate-email?email=${email}`,
    {
      method: 'GET'
    }
  )
  .then((response) => response.json())
  .then(({ isFound, userData }) => {
    if (isFound) {
      if (addMemberMessageStatus) {
        $("#add_member_message").hide();
        addMemberMessageStatus = false;
      }      
      $("#user_not_found").hide();
      const memberDiv = createMemberMarkup(userData);
      $("#added_members").append(memberDiv);
      memberList.push(userData.id);
      memberNames.push(userData.name);
      inputSpaceMembers.val("");
    } else {
      memberError.html("User not found!");
      memberError.show();
    }
  });
}

const deleteModaljQuery = (deleteModal) => {
  deleteModal.hide();
  $(document).off("keyup");
}

const deleteSpaceAPI = ({ event, space_id, deleteModal }) => {
  fetch(`${location.origin}/spaces/${space_id}`,
  {
    method: 'DELETE',
    body: JSON.stringify({
      user_id: globalUserDetails.id
    }),
    headers: {
      'Content-Type': 'application/json',
      authorization: `bearer ${globalUserDetails.accesstoken}`
    }
  })
  .then(response => response.json())
  .then(response => {
    event.path[2].remove();
    deleteModaljQuery(deleteModal);
  })
  .catch(error => {
    console.log("Error: ", error);
  })
}

const deleteSpaceModal = ({ event, space_id, space_name }) => {
  const deleteModal = $("#delete_modal");
  const deleteSpaceCancel = $("#delete_space_cancel");
  const yesDeleteSpace = $("#yes_delete_space");
  const noDeleteSpace = $("#no_delete_space");
  const deleteSpaceMessage = $("#delete_space_message");

  $(document).on("keyup", (e) => {
    if (e.which === 27) {
      deleteModaljQuery(deleteModal);
    }
  })
  
  deleteSpaceMessage.html(`Are you sure you want to delete space <span class="delete-space-style">${space_name}</span>?`)

  deleteSpaceCancel.on("click", () => {
    deleteModaljQuery(deleteModal);
  });

  noDeleteSpace.on("click", () => {
    deleteModaljQuery(deleteModal);
  });

  yesDeleteSpace.on("click", () => {
    deleteSpaceAPI({ event, space_id, deleteModal });
  });
  deleteModal.show();
}

const copySelectedHtmlLogic = ({ parentLi, selectedHtml }) => {
  const hiddenInput = document.createElement("input");
  hiddenInput.value = selectedHtml;
  parentLi.appendChild(hiddenInput);
  hiddenInput.select();
  document.execCommand("copy");
  parentLi.removeChild(hiddenInput);
  $("#copy_toast_div").fadeIn(1000);
  $("#copy_toast_div").fadeOut(1000);  
}

const deleteHighlightLogic = ({ highlightid, liToRemove }) => {
  deleteHighlightModal.show();
  yesDeleteHighlight.on("click", function(e) {
    fetch(
      "http://127.0.0.1:3000/highlights",
      {
        method: "DELETE",
        headers:  {
          'Content-Type': 'application/json',
          'authorization': `bearer ${globalUserDetails.accesstoken}`
        },
        body: JSON.stringify({
          highlighterid: highlightid,
          userid: globalUserDetails.id
        })
      })
      .then(res => res.json())
      .then(response => {
        if (response.status) {
          deleteHighlightModal.hide();
          $(liToRemove).fadeOut(800, () => {
            const highlightSiblingCount = liToRemove.parentElement.childElementCount;
            liToRemove.remove();
            if ((highlightSiblingCount - 1) === 0) {
              noHighlightMessage.css("display", "flex");
            }
          });
        } else {
          console.log("Not deleted: ", response.status);
        }
      })
      .catch(error => {
        console.log("Error: ", error);
      });
  })
}

const menuLogic = ({ e, parentLi, selectedHtml, highlightid, myHighlight, menuSignID }) => {
  const menuDiv = myHighlight ? $("#menu_div") : $("#other_menu_div");
  const menuDivWidth = 100;
  const menuDivHeight = 80;

  const screenWidth = screen.width;
  const screenHeight = screen.height;

  const clickedX = e.clientX;
  const clickedY = e.clientY;

  if (clickedX + menuDivWidth > screenWidth) {
    menuDiv.css("left", `${clickedX - menuDivWidth}px`);
  } else {
    menuDiv.css("left", `${clickedX}px`);
  }

  if (clickedY + menuDivHeight > screenHeight) {
    menuDiv.css("top", `${clickedY - menuDivHeight}px`);
  } else {
    menuDiv.css("top", `${clickedY}px`);
  }

  menuDiv.fadeIn(500);
  $(document).on("click", function(event) {
    if ( event.target.dataset.desc !== "menusign" 
    && event.target.id !== "menu_copy" 
    && event.target.id !== "menu_delete" && event.target.id !== "other_menu_copy"
    ) {
      menuDiv.fadeOut(300);
      // $(document).off("click");
    }
  });

  $("#menu_copy").add("#other_menu_copy").off("click");
  $("#menu_copy").add("#other_menu_copy").on("click", function(e) {
    copySelectedHtmlLogic({ parentLi, selectedHtml });
  });
  
  $("#menu_delete").off("click");
  $("#menu_delete").on("click", function(e) {
    deleteHighlightLogic({ liToRemove: parentLi, highlightid });
  });
}

const createHighlightMarkup = ({ myHighlight, highlightData, high }) => {
  const liClass = myHighlight ? "my-each-highlight" : "other-each-highlight";
  const mySuperDiv = "each-highlight-first-class";
  const parentDivClass = myHighlight ? "each-highlight-content" : "other-highlight-main";
  const divClass = myHighlight ? "my-each-highlight-div" : "other-each-highlight-div";
  const highlightNameDivClass = myHighlight ? "my-each-highlight-name" : "other-highlight-name";
  const menuSignDivClass = myHighlight ? "my-menu-sign-div" : "menu-sign-div";
  const menuSignClass = myHighlight ? "my-menu-sign fa fa-ellipsis-v" : "other-copy-sign fa fa-ellipsis-v";
  const parentLi = document.createElement("li");
  parentLi.className = liClass;

  const superDiv = document.createElement("div");
  superDiv.className = mySuperDiv;

  const parentDiv = document.createElement("div");
  parentDiv.className = parentDivClass;

  const highlightNameDiv = document.createElement("div");
  highlightNameDiv.className = highlightNameDivClass;
  highlightNameDiv.innerHTML = highlightData.highlight_name;

  const childDiv = document.createElement("div");
  childDiv.className = divClass;

  const menuSign = document.createElement("i");
  menuSign.classList = menuSignClass;
  menuSign.title = "Menu";
  menuSign.id = `menu_${highlightData.id}`
  menuSign.dataset.desc = "menusign";
  menuSign.onclick = (e) => {
    menuLogic({
      e,
      selectedHtml: highlightData.selected_html,
      parentLi,
      highlightid: highlightData.id,
      myHighlight,
      menuSignID: menuSign.id
    });
  };

  if (myHighlight) {
    parentDiv.appendChild(highlightNameDiv);
    parentDiv.appendChild(childDiv);
    superDiv.appendChild(parentDiv);

    const menuDiv = document.createElement("div");
    menuDiv.className = menuSignDivClass;
    menuDiv.appendChild(menuSign);
    superDiv.appendChild(menuDiv);

    parentLi.appendChild(superDiv);
    childDiv.innerHTML = `<a target="_blank" href="${highlightData.url}">${highlightData.selected_html}</a>`;
    return parentLi;
  }

  const memberNameDiv = document.createElement("div");
  memberNameDiv.className = "other-person-name";

  const memberNameSpan = document.createElement("span");
  memberNameSpan.className = "standard-highlight";
  memberNameSpan.innerHTML = highlightData.name;

  memberNameDiv.appendChild(memberNameSpan);
  childDiv.appendChild(memberNameDiv);

  childDiv.appendChild(highlightNameDiv);
  
  const highlightContenDiv = document.createElement("div");
  highlightContenDiv.className = "other-highlight-content"; 
  highlightContenDiv.innerHTML = `<a target="_blank" href="${highlightData.url}">${highlightData.selected_html}</a>`;

  childDiv.appendChild(highlightContenDiv);
  parentDiv.appendChild(childDiv);

  const menuDiv = document.createElement("div");
  menuDiv.className = menuSignDivClass;

  menuDiv.appendChild(menuSign);
  parentDiv.appendChild(menuDiv);
  parentLi.appendChild(parentDiv);

  return parentLi;
}

const getSpaceHighlights = ({ space_id }) => {
  const highlightsUL = $("#space_highlights_data");
  highlightsUL.empty();
  $("#guiding_message_div").hide();
  $("#loader_div_highlight").show();

  fetch(`${location.origin}/spaces/${space_id}/highlights?userid=${globalUserDetails.id}`,
  {
    method: "GET",
    headers: {
      authorization: `bearer ${globalUserDetails.accesstoken}`
    }
  })
  .then(response => response.json())
  .then(({ data: highlights }) => {
    $("#loader_div_highlight").hide();
    if (highlights.length === 0) {
      noHighlightMessage.css("display", "flex");
      return;
    } else {
      noHighlightMessage.hide();
    }

    highlights.map((eachHighlight) => {
      const generatedHighlightHtml = createHighlightMarkup({ 
        myHighlight: eachHighlight.userid === globalUserDetails.id,
        highlightData: eachHighlight
      }); 
      console.log(generatedHighlightHtml);
      highlightsUL.append(generatedHighlightHtml);
    });
  });
}

const createSpaceMarkup = (spaceData) => {
  const spaceLi = document.createElement("li");
  spaceLi.className = "each-space-entry";
  spaceLi.setAttribute("data-space-id", spaceData.space_id);
  spaceLi.onclick = () => {
    getSpaceHighlights({ space_id: spaceData.space_id })
  };

  const liChildDiv = document.createElement("div");
  liChildDiv.className = "each-space-div";

  const pTitle = document.createElement("p");
  pTitle.className = "each-space-title";
  pTitle.innerHTML = spaceData.space_name;

  const pMembers = document.createElement("p");
  pMembers.className = "each-space-members";
  const membersList = spaceData.members.map(eachMember => {
    return eachMember.name;
  });
  pMembers.innerHTML = membersList.join(", ");

  const deleteI = document.createElement("i");
  deleteI.classList = "space-delete-sign fa fa-trash-alt"
  deleteI.setAttribute("aria-hidden", "true");
  deleteI.onclick = (e) => {deleteSpaceModal({ event:e, space_id: spaceData.space_id, space_name: spaceData.space_name })};

  liChildDiv.appendChild(pTitle);
  liChildDiv.appendChild(pMembers);
  liChildDiv.appendChild(deleteI);
  spaceLi.appendChild(liChildDiv);
  return spaceLi;
};

const loadAllSpaces = (userid) => {
  $("#no_spaces").hide();
  fetch(`${location.origin}/spaces/all/api?userid=${userid}`,
  {
    method: "GET",
    headers: {
      authorization: `bearer ${globalUserDetails.accesstoken}`
    }
  })
  .then(response => response.json())
  .then(spaces => {
    const spacesUL = $("#spaces");
    spaceLoader.hide();
    if (spaces.data.length > 0) {
      spaces.data.map(eachSpace => {
        spacesUL.append(createSpaceMarkup(eachSpace));
      })
    } else {
      $("#no_spaces").show();
    } 
    
  })
}

const createNotificationMarkup = (notificatioData) => {
  const parentLi = document.createElement("li");
  parentLi.innerHTML = notificatioData.message;

  if (!notificatioData.isread) {
    parentLi.classList = "unread-notification notification-content-li";
  } else {
    parentLi.classList = "notification-content-li";
  }

  return parentLi;
}

const readAllNotifications = ({ user_id }) => {
  fetch(`${location.origin}/notifications/read-all`,
  {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id
    })
  })
  .then(response => response.json())
  .then(({ message }) => {
    console.log(message);
  })
  .catch(error => {
    console.log(error);
  });
}

const getMyHighlights = ({ user_id, accesstoken }) => {
  const highlightsUL = $("#space_highlights_data");
  highlightsUL.empty();
  $("#guiding_message_div").hide();
  $("#loader_div_highlight").show();
  fetch(`${location.origin}/highlights?userid=${user_id}&type=popup&page=1&size=300&to_include=0&current_space=-1`,
  {
    method: "GET",
    headers: {
      authorization: `bearer ${accesstoken}`
    }
  })
  .then(response => response.json())
  .then(({ data: highlights}) => {
    $("#loader_div_highlight").hide();
    highlights.map((eachHighlight) => {
      const generatedHighlightHtml = createHighlightMarkup({ 
        myHighlight: eachHighlight.userid === globalUserDetails.id,
        highlightData: eachHighlight
      }); 
      console.log(generatedHighlightHtml);
      highlightsUL.append(generatedHighlightHtml);
    });
  })
  .catch(error => {
    console.log(error);
  })
};

const getAllNotifications = () => {
  const user_id = globalUserDetails.id;
  fetch(`${location.origin}/notifications?user_id=${user_id}`,
  {
    method: "GET"
  })
  .then(response => response.json())
  .then(({ data:notifications }) => {
    const notificationsUL = $("#notification_content_ul");
    notificationsUL.empty();
    notifications.map(eachNotification => {
      notificationsUL.append(createNotificationMarkup(eachNotification));
    })
    readAllNotifications({ user_id });
  })
  .catch(error => {
    console.log(error);
  });
}

document.addEventListener("DOMContentLoaded", function(){
  chrome.runtime.sendMessage("mdffcdfacogbaacgmjhnidlmogmkejdj", {"message":"getUser"}, ({ userData:userDetails}) => {
    console.log("UsersLL ", userDetails);
    globalUserDetails = userDetails;
    const createSpaceButton = document.getElementById("create_space");
    memberError = $("#user_not_found");
    nameError = $("#name_error");
    inputSpaceMembers = $("#input_space_members");
    nameField = $("#input_space_name");
    spaceLoader = $("#loader_div");
    logoutButton = $("#spaces_logout_button");
    notificationButton = $("#natification_button");
    mySpaceEntry = $("#my_space_entry");
    deleteHighlightCancel = $("#delete_highlight_cancel");
    deleteHighlightModal = $("#delete_highlight_modal");
    noDeleteHighlight = $("#no_delete_highlight");
    yesDeleteHighlight = $("#yes_delete_highlight");
    closeButtonCreateModal = $("#modal_close_button");
    cancelButtonCreateModal = $("#modal_cancel_button");
    noHighlightMessage = $("#no_highlight_message_div");

    deleteHighlightCancel.add(noDeleteHighlight).on("click", function(e) {
      deleteHighlightModal.hide();
    });

    mySpaceEntry.on("click", () => {
      getMyHighlights({ user_id: globalUserDetails.id, accesstoken: globalUserDetails.accesstoken })
    });

    loadAllSpaces(userDetails.id);
    $("#input_space_name").on("keyup", function(e) {
      nameError.hide();
    });

    notificationButton.on("click", () => {
      $("#notification_content_tray").toggle();
      getAllNotifications();
    });

    logoutButton.on("click", () => {
      chrome.runtime.sendMessage("mdffcdfacogbaacgmjhnidlmogmkejdj", {"message":"logoutUser"}, ({ logoutSuccessful, data }) => {
        if (!logoutSuccessful) {
          console.log(data);
          return;
        } else {
          console.log("Logging out");
          location.href = `http://127.0.0.1:3000/users/login`
        }
      });
    });

    createSpaceButton.onclick = (() => {
      const span = document.getElementsByClassName("close")[0];
      const modal = document.getElementById("myModal");
     

      modal.style.display = "block";
      span.onclick = () => { modalCloseFunction(modal) };
      cancelButtonCreateModal.add(closeButtonCreateModal).on("click", () => {
        modalCloseFunction(modal);
      });

      inputSpaceMembers.on("keyup", function(e) {
        const currentVal = $(this).val();
        if ((e.key === "Enter" || e.keyCode === 13) && (currentVal !== '')) {
          validateEmail(currentVal);
        }
      });

      
      $("#modal_create_button").on("click", (e) => {
        const nameFieldVal = nameField.val();
        if (memberList.length == 0) {
          memberError.html("Atleast 1 member needed!");
          memberError.show();
          return;
        }

        if (nameFieldVal === '') {
          nameError.html("Give this space a name!");
          nameError.show();
          return;
        }

        memberList.push(globalUserDetails.id);
        memberNames.push(globalUserDetails.name);
        fetch(`${location.origin}/spaces/create/new`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },      
          body: JSON.stringify({
            created_by: userDetails.id,
            created_by_name: userDetails.name,
            members: memberList,
            name: nameFieldVal,
            member_names: memberNames
          })
        })
        .then(response => response.json())
        .then(response => {
          $("#no_spaces").hide();
          modal.style.display = "none";
          response.space.members = memberNames.map((element, index) => {
            return { name: element, userid: memberList[index] };
          });
          const spacesUL = $("#spaces");
          spacesUL.append(createSpaceMarkup(response.space));
        })
      });
    });
  });
});