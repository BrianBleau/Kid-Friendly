"use strict";

const form = document.querySelector(".form");
const containerVisits = document.querySelector(".visits");
const inputTitle = document.querySelector(".form__input--title");
const inputBathroom = document.querySelector(".form__input--bathroom");
const inputChanging = document.querySelector(".form__input--changing");
const inputSummary = document.querySelector(".form__input--summary");
const inputFeeding = document.querySelector(".form__input--feeding");
const inputRating = document.querySelector(".form__input--rating");

class Visit {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(
    coords,
    title,
    rating,
    bathroom,
    feeding,
    changing,
    summary,
    custom
  ) {
    this.coords = coords;
    this.title = title;
    this.rating = rating;
    this.bathroom = bathroom;
    this.feeding = feeding;
    this.changing = changing;
    this.summary = summary;
    this.custom = custom;
    this._setDisplayDate();
  }
  _setDisplayDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.displayDate = `${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class App {
  #map;
  #mapEvent;
  #visits = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener("submit", this._newVisit.bind(this));
    containerVisits.addEventListener("click", this._moveToMarker.bind(this));
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Could not get your position.");
      }
    );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on("click", this._showForm.bind(this));
    this.#visits.forEach((visit) => {
      this._renderVisit(visit);
      this._renderMarker(visit);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    //clear input fields
    inputTitle.value =
      inputRating.value =
      inputBathroom.value =
      inputChanging.value =
      inputFeeding.value =
      inputSummary.value =
        "";
    form.classList.remove("hidden");
  }
  _hideForm() {
    inputTitle.value =
      inputRating.value =
      inputBathroom.value =
      inputChanging.value =
      inputFeeding.value =
      inputSummary.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  _newVisit(e) {
    let custom;
    e.preventDefault();
    //get data from form
    const title = inputTitle.value;
    const summary = inputSummary.value;
    const changing = inputChanging.value;
    const feeding = inputFeeding.value;
    const bathroom = inputBathroom.value;
    const rating = inputRating.value;
    let { lat, lng } = this.#mapEvent.latlng;
    if (rating < 5) {
      custom = "bad";
    } else if (rating > 7) {
      custom = "good";
    } else {
      custom = "average";
    }
    const visit = new Visit(
      [lat, lng],
      title,
      rating,
      bathroom,
      feeding,
      changing,
      summary,
      custom
    );
    console.log(visit);
    this.#visits.push(visit);

    this._renderMarker(visit);
    this._renderVisit(visit);
    this._hideForm();
    this._setLocalStorage();
  }
  _renderMarker(visit) {
    L.marker(visit.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: `visit--${visit.custom}`,
        })
      )
      .setPopupContent(visit.title)
      .openPopup();
  }
  _renderVisit(visit) {
    const html = `
    <li class="visit visit--${visit.custom}" data-id="${visit.id}">
    <h2 class="visit__title">${visit.title} on ${visit.displayDate}</h2>
    <h2 class="visit__rating">Rating: ${visit.rating}</h2>
    <div class="visit__details">
      <span class="visit__bathroom">Bathrooms: ${visit.bathroom}</span>
      <span class="visit__changing">Changing Table: ${visit.changing}</span>
      <span class="visit__feeding">Feeding Area: ${visit.feeding}</span>
      <span class="visit__summary"
        >Summary: ${visit.summary}</span
      >
    </div>
  </li>`;
    form.insertAdjacentHTML("afterend", html);
  }
  _moveToMarker(e) {
    const visitEle = e.target.closest(".visit");
    if (!visitEle) return;
    const visit = this.#visits.find(
      (visit) => visit.id === visitEle.dataset.id
    );
    this.#map.setView(visit.coords, 15, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem("visits", JSON.stringify(this.#visits));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("visits"));
    if (!data) return;
    this.#visits = data;
  }
  reset() {
    localStorage.removeItem("visits");
    location.reload();
  }
}

const app = new App();
