import emitter from "component-emitter";
import messagesFilter from "../../stringData";

export default class Header extends emitter {
  constructor(container) {
    super();
    this.header = container.querySelector(".header");
    this.sectionNameEl = this.header.querySelector(".sectionName");

    const toggleNavBtn = this.header.querySelector("#toggleNavBtn");
    toggleNavBtn.addEventListener("click", this.toggleVisibleNav.bind(this));

    const showSearchFormBtn = this.header.querySelector("#searchBtn");
    showSearchFormBtn.addEventListener("click", this.toggleVisibleSearchForm.bind(this));

    const resetBtn = this.header.querySelector('.resetBtn');
    resetBtn.addEventListener('click', this.resetDb.bind(this))
  }

  resetDb(){
    this.emit('reset')
  }

  toggleVisibleNav() {
    this.emit("toggleNav");
  }

  getCurrentNameSection() {
    return this.sectionNameEl.textContent;
  }

  setNewNameSection(name) {
    if (name === messagesFilter.contentType.audio
      || name === messagesFilter.contentType.video
      || name === messagesFilter.contentType.image) {
      this.sectionNameEl.textContent = `Content: ${name}`;
      return;
    }
    if (name === messagesFilter.contentType.anotherType) {
      this.sectionNameEl.textContent = "Content: another type";
    }

    this.sectionNameEl.textContent = name;
  }

  toggleVisibleSearchForm() {
    this.emit("toggleSearchForm");
  }
}
