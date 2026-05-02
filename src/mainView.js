import ContentView from "./components/contentView/contentView";
import SendForm from "./components/forms/js/sendForm";
import Navigator from "./components/navigator/navigator";
import PinMessage from "./components/pinMMessage/pinMessage";
import SearchForm from "./components/forms/js/searchForm";
import emitter from "component-emitter";
import {proxyEvent} from "./utils";
import Header from "./components/header/header";

export default class MainView extends emitter {
  constructor(container) {
    super();
    this.rootContainer = container;
  }

  async bindToDOM() {
    this.header = new Header(this.rootContainer);
    this.header.on("toggleNav", this.toggleVisibleNav.bind(this));
    this.header.on("toggleSearchForm", this.toggleVisibleSearchForm.bind(this));
    this.header.on("reset", () => this.emit("reset"));

    this.navigator = new Navigator();
    this.navigator.on("getSectionName", this.getSectionName.bind(this));
    this.navigator.on("changeSectionNameInUI", (name) => this.header.setNewNameSection(name));

    this.searchForm = new SearchForm();
    this.searchForm.on("search", (data) => this.emit("search", data));
    this.searchForm.on("changeSectionNameInUI", (name) => this.header.setNewNameSection(name));

    this.sendForm = new SendForm(this.rootContainer);

    const contentContainerEl = this.rootContainer.querySelector(".container");
    this.contentView = new ContentView(contentContainerEl);

    proxyEvent(this.contentView, this, "needMoreMessages");
    proxyEvent(this.sendForm, this, "sendMessage");
    proxyEvent(this.navigator, this, "onMode");

    this.contentView.on("toFavorite", (id) => this.emit("toFavorite", id));
    this.contentView.on("unFavorite", (id) => this.emit("unFavorite", id));
    this.contentView.on("setToPin", (data) => this.emit("setToPin", data));
    this.contentView.on("deleteMessage", (id) => this.emit("deleteMessage", id));

    this.rootContainer.addEventListener("dragover", e => e.preventDefault());
    this.rootContainer.addEventListener("drop", this.dragAndDrop.bind(this));

    const pinAndAlertContainer = this.rootContainer.querySelector(".pinAndAlertMessages");
    this.pinMessage = new PinMessage(pinAndAlertContainer);
    this.pinMessage.on("deletePin", () => this.emit("deletePin"));
  }

  toggleVisibleNav() {
    this.navigator.toggleVisibleNav();
    this.searchForm.hideForm();
  }

  toggleVisibleSearchForm() {
    this.searchForm.toggleVisibleForm();
    this.navigator.hideNav();
  }

  dragAndDrop(e) {
    e.preventDefault();
    this.sendForm.showFileForm();
    this.sendForm.showDataChosenFile(e, e.dataTransfer.files[0]);
  }

  addMessages(list, filter) {
    this.contentView.drawMessageList(list, filter);
  }

  addOneMessage(msg, filter) {
    this.contentView.drawOneMessage(msg, false, filter);
  }

  addContentMessage(msg, filter) {
    this.contentView.drawContentMessage(msg, filter);
  }

  cleanContentView() {
    this.contentView.cleanContentContainer();
    this.pinMessage.removePin();
  }

  hideForms() {
    this.sendForm.hideAllForms();
  }

  showForms() {
    this.sendForm.showAllForms();
  }

  setPinMessage(msg) {
    this.pinData = msg;
    this.pinMessage.addMessage(msg);
  }

  removePin() {
    if (this.pinData) {
      this.pinMessage.removePin();
    }
    this.pinData = null;
  }

  removeMessage(id) {
    this.contentView.removeMessage(id);
  }

  showTextForm() {
    this.sendForm.changeForm();
  }

  getSectionName() {
    this.navigator.setSectionName(this.header.getCurrentNameSection());
  }
}
