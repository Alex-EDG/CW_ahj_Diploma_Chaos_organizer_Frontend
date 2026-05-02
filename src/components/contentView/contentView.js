import MessageView from "../message/messageView";
import dateFormat from "dateformat";
import DateMessageView from "../changeDateMessage/changeDateMessage";
import MessageContentView from "../contentMessage/messageContentView";
import emitter from "component-emitter";
import messagesFilter from "../../stringData";

export default class ContentView extends emitter {
  constructor(container) {
    super();
    this.container = container;
    this.today = dateFormat(new Date, "dd.mm.yy");
    this.lastDate = this.today;
    this.messages = [];
    this.addListeners();
    this.whole = 0;
  }

  addListeners() {
    this.scrollDown();
    this.container.addEventListener("scroll", e => {
      if (e.target.scrollTop === 0) {
        this.emit("needMoreMessages");
        this.scrollTop();
      }
    });
  }

  isWholeContainer() {
    if (this.container.clientHeight < this.container.scrollHeight) {
      this.whole++;
    }
  }


  scrollDown() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  scrollTop() {
    this.container.scrollTop = "10hv";
  }

  drawMessageList(list, filter) {
    for (const message of list) {
      const dateMsg = dateFormat(message.created, "dd.mm.yy");
      if (this.checkLastMsgDate(dateMsg)) {
        this.drawDateMessage(this.lastDate);
        this.lastDate = dateMsg;
      }
      if (!filter
        || filter === messagesFilter.messages
        || filter === messagesFilter.favorites
        || filter === messagesFilter.search) {
        this.drawOneMessage(message, true, filter);
      }
      else {
        this.drawContentMessage(message, filter);
      }
    }
    if (!filter
      || filter === messagesFilter.messages
      || filter === messagesFilter.favorites
      || filter === messagesFilter.search) {
      this.drawDateMessage(this.lastDate);
    }
  }

  drawDateMessage(date) {
    const msg = new DateMessageView(this.container);
    msg.drawDateMessage(date);
  }

  drawContentMessage(message, filter) {
    MessageView.changeDateAndTypeFormat(message);
    const messageContentView = new MessageContentView(this.container, filter);
    this.messages.push(messageContentView);
    messageContentView.drawContentMessage(message);
  }

  drawOneMessage(msg, revers, filter) {
    if (this.messages.find(x => x.id === msg.id)) {
      return;
    }
    MessageView.changeDateAndTypeFormat(msg);
    const msgView = new MessageView();

    msgView.on("toFavoriteById", (id) => this.emit("toFavorite", id));
    msgView.on("unFavoriteById", (id) => this.emit("unFavorite", id));
    msgView.on("setToPinData", (data) => this.emit("setToPin", data));
    msgView.on("showOptions", (msgWithOptions) => {
      for (const msg of this.messages) {
        if (msg.view !== msgWithOptions) {
          msg.view.hideOptions();
        }
      }
    });

    msgView.on("deleteMessageDyId", (data) => this.emit("deleteMessage", data));

    const msgViewEl = msgView.drawMessage(msg, revers, filter);
    this.messages.push({id: msg.id, msg: msgViewEl, view: msgView});
    if (!revers) {
      this.container.appendChild(msgViewEl);

    }
    else {
      this.container.insertAdjacentElement("afterbegin", msgViewEl);
    }

    if (!revers) {
      this.scrollDown();
    }
    this.isWholeContainer();
    if (revers && this.whole <= 1) {
      this.scrollDown();
    }
  }

  checkLastMsgDate(dateMsg) {
    return this.lastDate > dateMsg;
  }

  cleanContentContainer() {
    if (this.container.scrollTop === 0) {
      this.emit("needMoreMessages");
    }
    this.container.innerHTML = "";
    this.whole = 0;
    this.messages = [];
  }

  removeMessage(id) {
    if (!this.messages.find(x => x.id === id)) {
      return;
    }
    const msg = this.messages.find(msg => msg.id === id);
    msg.view.removeMessage();

    this.messages = this.messages.filter(msg => msg.id !== id);
  }
}
