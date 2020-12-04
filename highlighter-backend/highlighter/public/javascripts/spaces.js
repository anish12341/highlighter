const modalCloseFunction = (modal) => {
  modal.style.display = "none";
};

document.addEventListener("DOMContentLoaded", function(){
  const createSpaceButton = document.getElementById("create_space");
  createSpaceButton.onclick = (() => {
    const span = document.getElementsByClassName("close")[0];
    const modal = document.getElementById("myModal");
    const modalCancelButton = document.getElementById("modal_cancel_button");

    modal.style.display = "block";
    span.onclick = () => { modalCloseFunction(modal) };
    modalCancelButton.onclick = () => { modalCloseFunction(modal) };
  });
});