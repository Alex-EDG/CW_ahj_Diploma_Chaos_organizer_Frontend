export default class DateMessageView {
  constructor(container) {
    this.container = container;
  }

  drawDateMessage(date) {
    this.data = date;
    const dateMsg = document.createElement("div");
    dateMsg.classList.add("dateMsgWrp");
    dateMsg.textContent = date;
    this.container.insertAdjacentElement("afterbegin", dateMsg);
  }
}
