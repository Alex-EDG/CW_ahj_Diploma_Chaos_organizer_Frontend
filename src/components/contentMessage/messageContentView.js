import emitter from "component-emitter";
import messagesFilter from "../../stringData";

export default class MessageContentView extends emitter {
  constructor(container, filter) {
    super();
    this.container = container;
    this.filter = filter;
  }

  drawContentMessage(data) {
    this.data = data;
    const {content} = this.data;

    this.contentContainer = document.createElement("div");
    this.contentContainer.classList.add("containerContainer");

    this.fileEl = document.createElement("div");
    this.fileEl.classList.add("typeImgAndDescription");
    this.drawTypeImg();

    const description = document.createElement("span");
    description.classList.add("contentMessageDescription");
    description.textContent = content.text;

    this.fileEl.appendChild(description);
    this.contentContainer.appendChild(this.fileEl);

    const controlEl = document.createElement("a");
    controlEl.classList.add("contentControlsBtn");
    controlEl.href = content.download;
    controlEl.target = "_blank";
    controlEl.title = "Download file";
    controlEl.classList.add("loadBtn");
    controlEl.download = "content_name";
    this.contentContainer.appendChild(controlEl);

    this.container.appendChild(this.contentContainer);
  }

  drawTypeImg() {
    const typeFileEl = document.createElement("div");
    typeFileEl.classList.add("typeFileImg");

    switch (this.filter) {
      case messagesFilter.contentType.video:
        typeFileEl.classList.add("videoFile");
        break;
      case messagesFilter.contentType.audio:
        typeFileEl.classList.add("audioFile");
        break;
      case messagesFilter.contentType.image:
        typeFileEl.classList.add("imgFile");
        break;
      default:
        typeFileEl.classList.add("anotherFile");
        break;
    }

    this.fileEl.appendChild(typeFileEl);
  }

  removeMessage() {
    this.contentContainer.remove();
  }
}
