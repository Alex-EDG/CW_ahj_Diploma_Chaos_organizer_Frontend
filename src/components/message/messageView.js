import dateFormat from "dateformat";
import MessageOptions from "../messageOptions/messageOptions";
import emitter from "component-emitter";
import {replaceURLWithHTMLLinks} from "../../utils";
import MessageWithContent from "./messageWithContent";


export default class MessageView extends emitter {
  constructor() {
    super();
  }

  static changeDateAndTypeFormat(message) {
    if (message.created) {
      message.created = dateFormat(message.created, "HH:MM");
    }
    const typeSlashPos = message.type.indexOf("/");
    message.fullType = message.type;
    message.type = message.type.slice(0, typeSlashPos);
  }

  drawMessage(data, filter) {
    this.filter = filter;
    this.data = data;
    this.messageContainer = document.createElement("div");
    this.messageContainer.classList.add("messageContainer");

    const messageWrp = document.createElement("div");
    messageWrp.classList.add("messageWrp");

    const msgOptionsBtn = document.createElement("button");
    msgOptionsBtn.classList.add("msgOptionsBtn", "showOptions");
    msgOptionsBtn.title = "Message menu";
    msgOptionsBtn.addEventListener("click", this.showOptions.bind(this));

    messageWrp.appendChild(msgOptionsBtn);

    const {id, content, created} = this.data;
    this.message = document.createElement("div");
    this.message.classList.add("message");
    this.message.dataset.id = id;

    const textEl = document.createElement("div");

    textEl.innerHTML = replaceURLWithHTMLLinks(content.text.replaceAll("<", "&lt;")).replaceAll("\n", "<br>");
    textEl.classList.add("messageText");
    this.message.appendChild(textEl);

    if (content.id) {
      this.wrpFileContent = document.createElement("div");
      this.wrpFileContent.classList.add("wrpFileContent");
      this.message.classList.add("typeFile");
      this.drawFileMessage();
    }
    else {
      this.message.classList.add("typeText");
    }
    const timeEl = document.createElement("span");
    timeEl.classList.add("messageTime");
    timeEl.textContent = created;
    this.message.appendChild(timeEl);
    messageWrp.appendChild(this.message);
    this.messageContainer.appendChild(messageWrp);

    this.drawMessageOptions();
    return this.messageContainer;
  }

  drawMessageOptions() {
    const msgOptions = new MessageOptions();
    msgOptions.on("toFavorite", () => {
      this.emit("toFavoriteById", this.data.id);
      this.hideOptions();
    });
    msgOptions.on("unFavorite", () => {
      this.emit("unFavoriteById", this.data.id);
      this.hideOptions();
    });
    msgOptions.on("setToPin", () => {
      this.emit("setToPinData", this.data);
      this.hideOptions();
    });
    msgOptions.on("deleteMessage", () => {
      this.emit("deleteMessageDyId", this.data.id);
      this.hideOptions();
    });
    this.options = msgOptions.drawMessageOptions(this.filter);
    this.messageContainer.insertAdjacentElement("afterbegin", this.options);
  }

  showOptions() {
    this.options.classList.toggle("hidden");
    if (!this.options.classList.contains("hidden")) {
      this.emit("showOptions", this);
    }
  }

  hideOptions() {
    this.options.classList.add("hidden");
  }

  drawFileMessage() {
    const {type, content, fullType} = this.data;
    let message;
    switch (type) {
      case "image":
        message = new MessageWithContent(type, content, fullType, this.wrpFileContent);
        message.drawImage();
        break;
      case "video":
        message = new MessageWithContent(type, content, fullType, this.wrpFileContent);
        message.drawVideo();
        break;
      case "audio":
        message = new MessageWithContent(type, content, fullType, this.wrpFileContent);
        message.drawAudio();
        break;
      default:
        message = new MessageWithContent(type, content, fullType, this.wrpFileContent);
        message.drawAnonymousFile();
    }
    this.message.appendChild(this.wrpFileContent);
  }

  removeMessage() {
    this.messageContainer.remove();
  }
}
