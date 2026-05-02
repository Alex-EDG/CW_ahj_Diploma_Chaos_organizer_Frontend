import emitter from "component-emitter";
import dateFormat from "dateformat";

export default class PinMessage extends emitter {
  constructor(container) {
    super();
    this.container = container;
    this.pin = this.container.querySelector(".pin");
    this.descriptionEl = this.container.querySelector(".pinText");
    this.dateEl = this.container.querySelector(".pinDate");
    this.typeEl = this.container.querySelector(".pinFile");
    this.removeBtn = this.container.querySelector(".removePinBtn");
    this.removeBtn.addEventListener("click", this.deletePin.bind(this));
  }

  addMessage(data) {
    this.pin.style.display = "flex";
    this.removeStyles();

    const {type, content, created} = data;

    this.descriptionEl.textContent = content.text;
    this.dateEl.textContent = dateFormat(created, "dd.mm.yy");

    if (content.id) {
      if (type.startsWith("video/")) this.typeEl.classList.add("videoFile");
      else if (type.startsWith("audio/")) this.typeEl.classList.add("audioFile");
      else if (type.startsWith("image/")) this.typeEl.classList.add("imgFile");
      else this.typeEl.classList.add("anotherFile");
    }
  }

  removeStyles() {
    this.descriptionEl.textContent = "";
    this.dateEl.textContent = "";
    if (this.typeEl.classList.contains("videoFile")) this.typeEl.classList.remove("videoFile");
    if (this.typeEl.classList.contains("audioFile")) this.typeEl.classList.remove("audioFile");
    if (this.typeEl.classList.contains("imgFile")) this.typeEl.classList.remove("imgFile");
    if (this.typeEl.classList.contains("anotherFile")) this.typeEl.classList.remove("anotherFile");
  }

  deletePin() {
    this.emit("deletePin");
  }

  removePin() {
    this.pin.style.display = "none";
    this.removeStyles();
  }
}
