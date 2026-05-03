import Controller from "./controller";
import Api from "./api";
import MainView from "./mainView";

// const url = "http://localhost:7075/api";
const url = "https://cw-ahj-diploma-chaos-organizer-back.vercel.app/api";
// const url = "https://cw-ahj-diploma-chaos-organizer-backend.onrender.com/api";
const container = document.querySelector("#root");
const mainView = new MainView(container);
const api = new Api(url);

new Controller(mainView, api);
