import emitter from "component-emitter";

export default class SendForm extends emitter {

  constructor(mainContainer) {
    super();
    this.mainContainer = mainContainer;
    this.container = this.mainContainer.querySelector(".forms");

    this.addListeners();
  }

  addListeners() {
    this.changeFormBtn = this.container.querySelector(".changeFormBtn");
    this.changeFormBtn.addEventListener("click", this.changeForm.bind(this));

    this.fileInput = this.container.querySelector(".fileInput");
    this.fileInput.addEventListener("input", this.showDataChosenFile.bind(this));

    this.textForm = this.container.querySelector(".sendText");
    this.fileForm = this.container.querySelector(".sendFile");

    this.textForm.querySelector("textarea").addEventListener("keypress", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendText();
      }
    });

    this.fileForm.querySelector("textarea").addEventListener("keypress", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendFile();
      }
    });

    this.textForm.addEventListener("submit", this.sendText.bind(this));
    this.fileForm.addEventListener("submit", this.sendFile.bind(this));


    this.dataChosenFile = this.container.querySelector(".dataChosenFile");
    this.inputDescribe = this.container.querySelector(".inputDescribe");
    this.chosenFileName = this.container.querySelector(".chosenFileName");
    this.typeEl = this.container.querySelector(".chosenFileType");
  }

  // sendTextForm <-> sendFileForm
  changeForm() {
    if (this.fileForm.classList.contains("hidden")) {
      this.changeFormBtn.classList.remove("toFileFormBtn");
      this.changeFormBtn.classList.add("toTextFormBtn");
      this.textForm.reset();
    } else {
      this.changeFormBtn.classList.remove("toTextFormBtn");
      this.changeFormBtn.classList.add("toFileFormBtn");
      this.fileForm.reset();
    }

    this.textForm.classList.toggle("hidden");
    this.fileForm.classList.toggle("hidden");
  }

  showFileForm() {
    if (this.fileForm.classList.contains("hidden")) {
      this.changeFormBtn.classList.remove("toFileFormBtn");
      this.changeFormBtn.classList.add("toTextFormBtn");
      this.textForm.classList.add("hidden");
      this.fileForm.classList.remove("hidden");
      this.textForm.reset();
    }
  }

  hideAllForms() {
    const height = this.container.clientHeight;
    this.changeFormBtn.classList.add("hidden");
    for (const formEl of this.container.querySelectorAll(".form")) {
      if (!formEl.classList.contains("hidden")) {
        formEl.classList.add("hidden");
      }
    }
    this.container.style.height = height + "px";
  }

  showAllForms() {
    this.textForm.classList.remove("hidden");
    this.changeFormBtn.classList.remove("hidden");
    this.container.style.height = "fit-content";
  }


// sendFileForm changing

  showDataChosenFile(e, file) {
    this.dropFile = file ? file : this.dropFile;
    if (!file) {
      file = e.target.files[0];
    }
    this.dataChosenFile.style.display = "inline-flex";
    this.inputDescribe.style.display = "block";
    this.chosenFileName.textContent = file.name;
    const typeSlashPos = file.type.indexOf("/");
    const type = file.type.slice(0, typeSlashPos);
    this.toggleChosenFileTypeShowElem(type);
  }

  toggleChosenFileTypeShowElem(type) {
    switch (type) {
      case "image":
        this.typeEl.classList.toggle("typeImg");
        break;
      case "video":
        this.typeEl.classList.toggle("typeVideo");
        break;
      case "audio":
        this.typeEl.classList.toggle("typeAudio");
        break;
      default:
        this.typeEl.classList.toggle("typeAnother");
    }
  }

  hideChosenFileData() {
    this.dataChosenFile.style.display = "none";
    this.inputDescribe.style.display = "none";
    this.chosenFileName.textContent = "";
  }

//send messages

  sendText(e) {
    e?.preventDefault();
    const data = new FormData(this.textForm);
    const obj = Object.fromEntries(data);
    this.emit("sendMessage", obj.text);
    this.textForm.reset();
  }

  sendFile(e) {
    e?.preventDefault();
    const data = new FormData(this.fileForm);
    const obj = Object.fromEntries(data);
    const file = this.dropFile ? this.dropFile : obj.file;
    file.text = obj.text;
    this.emit("sendMessage", file);
    const typeSlashPos = file.type.indexOf("/");
    this.toggleChosenFileTypeShowElem(file.type.slice(0, typeSlashPos));
    this.hideChosenFileData();
    this.dropFile = undefined;
    this.fileForm.reset();
  }

}
