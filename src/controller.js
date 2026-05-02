import messagesFilter from "./stringData";
import stringData from "./stringData";

export default class Controller {
  constructor(view, api) {
    this.view = view;
    this.api = api;
    this.start = 0;
    this.limit = 10;
    this.filter = messagesFilter.messages;

    this.view.on("needMoreMessages", this.needMoreMessages.bind(this));
    this.view.on("sendMessage", this.sendMessage.bind(this));
    this.view.on("onMode", this.mode.bind(this));
    this.view.on("toFavorite", (id) => this.toAndFromFavorite(id, true));
    this.view.on("unFavorite", (id) => this.toAndFromFavorite(id, false));
    this.view.on("setToPin", this.setPinMessage.bind(this));
    this.view.on("deletePin", this.deletePin.bind(this));
    this.view.on("deleteMessage", this.deleteMessage.bind(this));
    this.view.on("search", this.searchMessagesByText.bind(this));
    this.view.on("reset", this.loadDefaultSession.bind(this));
    this.api.on("newMessageInDB", this.getNewMessageInDB.bind(this));
    this.api.on("deleteMessageFromDB", (id) => this.view.removeMessage(id));
    this.api.on("newPinFromDB", (pin) => {
      if (this.filter === stringData.messages) {
        this.view.setPinMessage(pin);
      }
    });
    this.api.on("upPinFromDB", () => {
      if (this.filter === stringData.messages) {
        this.view.removePin();
      }
    });
    this.api.on("newFavoriteFromDB", this.getNewFavoriteFromDB.bind(this));
    this.api.on("onUnFavoriteFromDB", this.onUnFavoriteFromDB.bind(this));

    // noinspection JSIgnoredPromiseFromCall
    this.init();
  }

  async init() {
    if (!this.view) {
      console.log("DOM Error");
      return;
    }

    // noinspection ES6MissingAwait
    this.getLocation();
    await this.view.bindToDOM();
    await this.needMoreMessages();
  }

  async loadDefaultSession() {
    const result = await this.api.setDefaultDB();
    if (result) {
      window.location.reload();
    }
  }

  async getLocation() {
    let resolvePromise;

    if (!navigator.geolocation) {
      return new Promise(resolve => resolve(null));
    }

    navigator.geolocation.getCurrentPosition(data => {
      resolvePromise({latitude: data.coords.latitude, longitude: data.coords.longitude});
    }, () => resolvePromise(null));

    return new Promise(resolve => resolvePromise = resolve);
  }

  async checkPin() {
    const pin = await this.api.getPin();
    if (pin) {
      this.view.setPinMessage(pin);
    }
  }

  getNewMessageInDB(msg) {
    if (this.filter === stringData.messages) {
      msg = this.processMessages([msg])[0];
      this.view.addOneMessage(msg, this.filter);
      return;
    }
    if (this.filter !== stringData.favorites && msg.content.id) {
      if (msg.type.startsWith(this.filter)) {
        this.view.addContentMessage(msg, this.filter);
        return;
      }

      if (this.filter === stringData.contentType.anotherTypeFilter) {
        this.view.addContentMessage(msg, this.filter);
      }
    }
  }

  getNewFavoriteFromDB(msg) {
    console.log("getNewFavoriteFromDB msg", msg);
    if (this.filter === stringData.favorites) {
      console.log("getNewFavoriteFromDB filter", this.filter);
      msg = this.processMessages([msg])[0];
      this.view.addOneMessage(msg, this.filter);
    }
  }

  onUnFavoriteFromDB(id) {
    if (this.filter === stringData.favorites) {
      this.view.removeMessage(id);
    }
  }

  processMessages(list) {
    if (list.length === 0) {
      return list;
    }
    for (const msg of list) {
      if (msg.content.id) {
        msg.content.href = `${this.api.url}/content/${msg.content.id}`;
        msg.content.download = `${this.api.url}/download/${msg.content.id}`;
      }
    }
    return list;
  }

  async needMoreMessages() {
    const options = {start: this.start, limit: this.limit, filter: this.filter, searchText: null};
    this.start += this.limit;
    const list = await this.getMessagesList(options);

    if (!list) {
      return;
    }

    this.view.addMessages(list, this.filter);
    if (this.filter === messagesFilter.messages) {
      await this.checkPin();
    }
  }

  async getMessagesList(options) {
    const newList = await this.api.getLastMessagesList(options);

    if (newList.length === 0) {
      return null;
    }
    return this.processMessages(newList);
  }

  async searchMessagesByText(data) {
    this.filter = messagesFilter.search;
    const options = {start: 0, limit: this.limit, filter: this.filter, searchText: data};

    const list = await this.getMessagesList(options);
    if (!list) {
      return;
    }

    this.view.cleanContentView();
    this.view.addMessages(list, this.filter);
  }

  async setPinMessage(data) {
    const pin = await this.api.setToPin(data.id);
    this.view.setPinMessage(pin);
  }

  async deletePin() {
    const result = await this.api.deletePinFromServer();
    if (result) {
      this.view.removePin();
    }
  }

  async sendMessage(data) {
    const coords = await this.getLocation();

    let msgFullData;
    if (typeof (data) !== "string") {
      msgFullData = await this.api.createNewFileMsg(data, coords);
      msgFullData.content.href = `${this.api.url}/content/${msgFullData.content.id}`;
      this.view.showTextForm();
    }
    else {
      msgFullData = await this.api.createNewTextMsg(data, coords);
    }

    msgFullData = this.processMessages([msgFullData])[0];
    this.view.addOneMessage(msgFullData, this.filter);
  }

  async toAndFromFavorite(id, isFavorite) {
    await this.api.toAndFromFavorite(id, isFavorite);
    if (this.filter === stringData.favorites && !isFavorite) {
      this.view.removeMessage(id);
    }
  }

  async deleteMessage(id) {
    if (!await this.api.deleteMessage(id)) {
      return;
    }
    this.view.removeMessage(id);
  }

  async mode(filter) {
    this.filter = filter;
    this.start = 0;
    this.view.cleanContentView();
    if (filter !== messagesFilter.messages) {
      this.view.hideForms();
    }
    else {
      this.view.showForms();
    }
  }
}
