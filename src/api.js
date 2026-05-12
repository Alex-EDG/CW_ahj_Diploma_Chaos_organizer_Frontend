import messagesFilter from "./stringData";
import {slugify} from "transliteration";
import emitter from "component-emitter";

export default class Api extends emitter {
  constructor(url) {
    super();
    this.url = url;
    const eventSourse = new EventSource(`${url}/sse`, {withCredentials: false});
    eventSourse.addEventListener("open", this.onOpen.bind(this));
    eventSourse.addEventListener("error", this.onError.bind(this));
    eventSourse.addEventListener("newMessage", this.onNewMessage.bind(this));
    eventSourse.addEventListener("deleteMessage", this.onDeleteMessage.bind(this));
    eventSourse.addEventListener("setNewPin", this.onSetPin.bind(this));
    eventSourse.addEventListener("upPinMsg", this.onUnPin.bind(this));
    eventSourse.addEventListener("onToFavorite", this.onToFavorite.bind(this));
    eventSourse.addEventListener("onUnFavorite", this.onUnFavorite.bind(this));
  }

  onOpen(e) {
    console.log("open", e);
  }

  onError(e) {
    console.log("onError", e);
  }

  onNewMessage(e) {
    const data = JSON.parse(e.data);
    this.emit("newMessageInDB", data.msg);
  }

  onDeleteMessage(e) {
    const data = JSON.parse(e.data);
    this.emit("deleteMessageFromDB", data.id);
  }

  onSetPin(e) {
    const data = JSON.parse(e.data);
    this.emit("newPinFromDB", data.pin);
  }

  onUnPin() {
    this.emit("upPinFromDB");
  }

  onToFavorite(e) {
    const data = JSON.parse(e.data);
    this.emit("newFavoriteFromDB", data.msg);
  }

  onUnFavorite(e) {
    const data = JSON.parse(e.data);
    this.emit("onUnFavoriteFromDB", data.id);
  }

  async setDefaultDB() {
    const url = this.url + `/messages/reset`;
    const request = fetch(url, {
      method: "POST",
      credentials: "omit",
    });
    const result = await request;
    if (result.status !== 200) {
      console.log("error");
      return;
    }
    return true;
  }

  createHeaders(coords, file) {
    const headers = {
      "Content-Type": file?.type ?? "text/plain",
    };

    if (file) {
      headers["X-File-Name"] = slugify(file.name);
      headers["X-File-describe"] = encodeURI(file.text);
    }

    if (coords) {
      headers["X-longitude"] = coords.longitude;
      headers["X-latitude"] = coords.latitude;
    }
    return headers;
  }

  async createNewFileMsg(file, coords) {
    const url = this.url + `/messages/file`;
    const headers = this.createHeaders(coords, file);
    const request = fetch(url, {
      method: "POST",
      credentials: "omit",
      headers,
      body: file
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
      return;
    }
    return await result.json();
  }

  async createNewTextMsg(text, coords) {
    const headers = this.createHeaders(coords, null);
    const url = this.url + `/messages/text`;
    const request = fetch(url, {
      method: "POST",
      credentials: "omit",
      headers,
      body: text
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
      return;
    }
    return await result.json();
  }

  async getLastMessagesList(options) {
    const {start, limit, filter, searchText} = options;
    let url;
    if (searchText) {
      url = this.url + `/messages?start=${start}&limit=${limit}&text=${searchText}`;
    }
    else if (filter && filter !== messagesFilter.messages && filter !== messagesFilter.search) {
      if (filter === messagesFilter.favorites) {
        url = this.url + `/messages?start=${start}&limit=${limit}&favorite=${true}`;
      }
      else {
        url = this.url + `/messages?start=${start}&limit=${limit}&type=${filter}`;
      }
    }
    else {
      url = this.url + `/messages?start=${start}&limit=${limit}`;
    }
    const request = fetch(url, {
      method: "GET",
      credentials: "omit"
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
      return;
    }
    return await result.json();
  }


  async toAndFromFavorite(id, isFavorite) {
    const url = this.url + `/messages/${id}`;
    const request = fetch(url, {
      method: "PATCH",
      credentials: "omit",
      body: isFavorite
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
      return false;
    }
    return true;
  }

  async setToPin(id) {
    const url = this.url + `/messages/pin`;
    const request = fetch(url, {
      method: "PUT",
      credentials: "omit",
      body: id
    });
    const result = await request;
    if (!result.ok) {
      // console.log(await result.text());
      return;
    }
    return await result.json();
  }

  async deletePinFromServer() {
    const url = this.url + `/messages/pin`;
    const request = fetch(url, {
      method: "DELETE",
      credentials: "omit",
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
    }
    return result;
  }

  async deleteMessage(id) {
    const url = this.url + `/messages/${id}`;
    const request = fetch(url, {
      method: "DELETE",
      credentials: "omit",
    });
    const result = await request;
    if (!result.ok) {
      console.log(await result.text());
      return false;
    }
    return true;
  }

  async getPin() {
    const url = this.url + `/messages/pin`;
    const request = fetch(url, {
      method: "GET",
      credentials: "omit",
    });
    const result = await request;
    if (result.status !== 200) {
      console.log(await result.text());
      return false;
    }
    return await result.json();
  }
}
