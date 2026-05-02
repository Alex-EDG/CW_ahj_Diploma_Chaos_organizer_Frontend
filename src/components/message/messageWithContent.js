import {secondsToTimeFormat} from "../../utils";

export default class MessageWithContent {
  constructor(type, content, fullType, container) {
    this.type = type;
    this.content = content;
    this.container = container;
    this.fullType = fullType;
  }

  drawVideo() {
    const video = document.createElement("video");
    this.element = video;
    this.progressBarEvents();
    this.drawControlsWrp();
    video.classList.add("videoMsg");
    video.src = this.content.href;
    video.controls = false;
    video.muted = false;

    video.addEventListener("click", this.videoOnClick.bind(this));
    video.addEventListener("ended", this.mediaElementOnEnd.bind(this));

    this.container.appendChild(video);
    this.drawProgressBar();
  }

  videoOnClick() {
    (this.element.paused) ? this.mediaElementOnPlay() : this.mediaElementOnStop();
  }

  drawAudio() {
    const audio = document.createElement("audio");
    this.element = audio;

    audio.classList.add("audioMsg");
    audio.src = this.content.href;
    audio.type = this.fullType;
    audio.preload = "metadata";
    audio.controls = false;
    audio.muted = false;
    this.progressBarEvents();

    this.drawControlsWrp(audio);
    this.drawProgressBar();

    this.container.appendChild(audio);
  }

  progressBarEvents() {
    this.element.addEventListener("canplay", () => {
      this.duration = this.element.duration;
      this.durationOnePersent = this.duration / 100;
      const valueToDraw = this.progress.value === 0 ? "0 : 00" : `${this.progress.value}`;
      this.durationForDraw = secondsToTimeFormat(Math.floor(this.duration));
      this.progressText.textContent = `${valueToDraw} | ${this.durationForDraw}`;
    });

    this.element.addEventListener("timeupdate", () => {
      this.progress.value = this.element.currentTime / this.durationOnePersent;
      this.value = Math.floor(this.element.currentTime);
      this.progressText.textContent = `${secondsToTimeFormat(this.value)} | ${this.durationForDraw}`;
    });
  }

  async mediaElementOnPlay() {
    this.playBtnOnPlay();
    await this.element.play();
  }

  mediaElementOnStop() {
    this.playBtnOnStop();
    this.element.pause();
  }

  mediaElementOnEnd() {
    this.playBtnOnStop();
  }

  drawProgressBar() {
    const duration = this.durationForDraw || "00";
    const progressWRP = document.createElement("div");
    progressWRP.classList.add("progressWRP");
    this.progress = document.createElement("progress");
    this.progress.classList.add("progressBar");
    this.progress.max = 100;
    this.progress.value = this.value || 0;
    const valueNow = this.progress.value === 0 ? "0 : 00" : `${this.progress.value}`;
    progressWRP.appendChild(this.progress);
    this.progressText = document.createElement("span");
    this.progressText.textContent = `${valueNow} | ${duration}`;
    this.progressText.classList.add("progressText");
    progressWRP.appendChild(this.progressText);
    this.container.appendChild(progressWRP);
  }

  drawImage() {
    this.container.querySelector(".brokenImg")?.remove();
    this.drawControlsWrp();
    const img = document.createElement("img");
    img.classList.add("imgMsg");
    img.src = this.content.href;
    img.onerror = e => {
      e.target.remove();
      const defaultImg = document.createElement("div");
      defaultImg.classList.add("brokenImg");
      this.container.appendChild(defaultImg);
    };
    img.alt = this.content.text;
    this.container.appendChild(img);
  }

  drawAnonymousFile() {
    this.drawControlsWrp();
    const fileImgAndName = document.createElement("div");
    fileImgAndName.classList.add("wrpAnotherType");

    const typeImg = document.createElement("div");
    typeImg.classList.add("anotherFileTypeImg");
    fileImgAndName.appendChild(typeImg);

    const fileName = document.createElement("span");
    fileName.classList.add("anotherFileName");
    fileName.textContent = this.content.name;
    fileImgAndName.appendChild(fileName);

    this.container.appendChild(fileImgAndName);
  }

  drawControlsWrp() {
    const controls = document.createElement("div");
    controls.classList.add("contentControls");
    this.drawControlBtn("load", controls,);
    if (this.type === "video" || this.type === "audio") {
      this.drawControlBtn("play", controls);
      this.drawControlBtn("mute", controls);
      this.drawControlBtn("volumeUp", controls);
      this.drawControlBtn("volumeDown", controls);
    }
    this.container.appendChild(controls);
  }

  drawControlBtn(use, controlsContainer) {
    let controlEl;
    switch (use) {
      case "load":
        controlEl = this.drawLoadBtn();
        break;
      case "play":
        controlEl = this.drawPlayBtn();
        break;
      case "mute":
        controlEl = this.drawMuteBtn();
        break;
      case "volumeUp":
        controlEl = this.drawVolumeUpBtn();
        break;
      case "volumeDown":
        controlEl = this.drawVolumeDownBtn();
        break;
    }
    controlsContainer.appendChild(controlEl);
  }

  async playBtnOnClick() {
    if (this.element.paused) {
      await this.mediaElementOnPlay();
    }
    else {
      this.mediaElementOnStop();
    }
  }

  playBtnOnPlay() {
    this.playBtn.classList.remove("playBtn");
    this.playBtn.classList.add("stopBtn");
    this.playBtn.title = "Stop";
  }

  playBtnOnStop() {
    this.playBtn.classList.remove("stopBtn");
    this.playBtn.classList.add("playBtn");
    this.playBtn.title = "Play";
  }

  drawPlayBtn() {
    this.playBtn = document.createElement("button");
    this.playBtn.title = "Play";
    this.playBtn.classList.add("contentControlsBtn", "playBtn");
    this.playBtn.addEventListener("click", this.playBtnOnClick.bind(this));
    return this.playBtn;
  }

  drawLoadBtn() {
    const loadBtn = document.createElement("a");
    loadBtn.target = "_blank";
    loadBtn.classList.add("contentControlsBtn", "loadBtn");
    loadBtn.title = "Download file";
    loadBtn.href = this.content.download;
    loadBtn.download = "content_name";
    return loadBtn;
  }

  drawVolumeUpBtn() {
    this.volumeUpBtn = document.createElement("button");
    this.volumeUpBtn.title = "Volume up";
    this.volumeUpBtn.classList.add("contentControlsBtn", "volumeUp");
    this.volumeUpBtn.addEventListener("click", this.volumeUp.bind(this));
    return this.volumeUpBtn;
  }

  drawVolumeDownBtn() {
    this.volumeDownBtn = document.createElement("button");
    this.volumeDownBtn.title = "Volume down";
    this.volumeDownBtn.classList.add("contentControlsBtn", "volumeDown");
    this.volumeDownBtn.addEventListener("click", this.volumeDown.bind(this));
    return this.volumeDownBtn;
  }

  volumeUp() {
    this.element.volume = this.element.volume >= 1 ? this.element.volume : this.element.volume + 0.1;
  }

  volumeDown() {
    this.element.volume = this.element.volume === 0 ? this.element.volume : this.element.volume - 0.1;
  }

  drawMuteBtn() {
    this.muteBtn = document.createElement("button");
    this.muteBtn.title = "Mute";
    this.muteBtn.classList.add("contentControlsBtn", "muteBtn");
    this.muteBtn.addEventListener("click", this.muteToggle.bind(this));
    return this.muteBtn;
  }

  toggleActivityVolumeBtn() {
    this.volumeUpBtn.classList.toggle("inactive");
    this.volumeDownBtn.classList.toggle("inactive");
  }

  muteToggle() {
    if (!this.element.muted) {
      this.element.muted = true;
      this.muteBtn.classList.remove("muteBtn");
      this.muteBtn.classList.add("unMuteBtn");
      this.muteBtn.title = "Unmute";
      this.toggleActivityVolumeBtn();
    }
    else {
      this.element.muted = false;
      this.muteBtn.classList.remove("unMuteBtn");
      this.muteBtn.classList.add("muteBtn");
      this.muteBtn.title = "Mute";
      this.toggleActivityVolumeBtn();
    }
  }
}




