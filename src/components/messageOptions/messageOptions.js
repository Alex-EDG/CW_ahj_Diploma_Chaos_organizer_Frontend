import emitter from "component-emitter";
import messagesFilter from "../../stringData";

export default class MessageOptions extends emitter {
  constructor(id) {
    super();
    this.id = id;
  }

  drawMessageOptions(filter) {
    this.optionsContainer = document.createElement("div");
    this.optionsContainer.classList.add("optionsContainer", "hidden");
    if (filter !== messagesFilter.favorites) {
      this.drawButton("toFavorite");
    }
    this.drawButton("unFavorite");
    this.drawButton("toPin");
    this.drawButton("delete");
    return this.optionsContainer;
  }

  drawButton(use) {
    const btn = document.createElement("button");
    btn.classList.add("msgOptionsBtn", "optionBtn");

    switch (use) {
      case "toFavorite":
        btn.classList.add("toFavorite");
        btn.title = "To do favorite";
        btn.addEventListener("click", () => {
          this.emit("toFavorite");
        });
        break;
      case "unFavorite":
        btn.classList.add("unFavorite");
        btn.title = "To delete from favorite";
        btn.addEventListener("click", () => {
          this.emit("unFavorite");
        });
        break;
      case "toPin":
        btn.classList.add("toPin");
        btn.title = "To pin this message";
        btn.addEventListener("click", () => {
          this.emit("setToPin");
        });
        break;
      case "delete":
        btn.classList.add("delete");
        btn.title = "Delete this message";
        btn.addEventListener("click", () => this.emit("deleteMessage"));
        break;
    }
    this.optionsContainer.appendChild(btn);
  }
}
