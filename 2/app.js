//02b6a0795d61447a9c82d360a1fc15bc
//Custom HttpModule

const allCategories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];

function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();

        //xhr.setRequestHeader("access-control-allow-origin", "*");
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.addEventListener("load", () => {
        if (Math.floor(xhr.status / 100) !== 2) {
          cb(`Error status: ${xhr.status}`, xhr);
          return;
        }
        const response = JSON.parse(xhr.responseText);
        cb(null, response);
      });

      xhr.addEventListener("error", () => {
        cb(`Error status: ${xhr.status}`, xhr);
      });

      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      xhr.send(JSON.stringify(body));
    },
  };
}
// Init http module
const http = customHttp();

function renderPage() {
  return http.get(
    "https://restcountries.eu/rest/v2/alpha?codes=ae;ar;at;au;be;bg;br;ca;ch;cn;co;cu;cz;de;eg;fr;gb;gr;hk;hu;id;ie;il;in;it;jp;kr;lt;lv;ma;mx;my;ng;nl;no;nz;ph;pl;pt;ro;rs;ru;sa;se;sg;si;sk;th;tr;tw;ua;us;ve;za",
    onGetCountries
  );
}

function onGetCountries(err, res) {
  if (err) {
    showAlert(err, "error-msg");
    return;
  }
  renderSelect(res);
}

function renderSelect(countries) {
  const countriesContainer = document.getElementById("country");
  let fragment = ``;
  countries.forEach((countriesItem) => {
    const el = contryTemplate(countriesItem);
    fragment += el;
  });
  countriesContainer.insertAdjacentHTML("afterbegin", fragment);

  const categoriesContainer = document.getElementById("category");
  fragment = ``;
  allCategories.forEach((categoryItem) => {
    const el = contryTemplate({ name: categoryItem, alpha2Code: categoryItem });
    fragment += el;
  });
  categoriesContainer.insertAdjacentHTML("afterbegin", fragment);

  M.AutoInit();
  loadNews();
}

function contryTemplate({ name, alpha2Code } = {}) {
  return `
  <option value="${alpha2Code}">${name}</option>`;
}

//News Service
const newsService = (function () {
  const apiKey = "02b6a0795d61447a9c82d360a1fc15bc";
  const apiUrl = "http://newsapi.org/v2";
  return {
    topHeadlines(country = "ua", category = "general", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

//Elements

const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const inputSearch = form.elements["search"];
const categorySelect = form.elements["category"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  renderPage();
  // loadNews();
});

//Load News Function
function loadNews() {
  showLoader();
  const country = countrySelect.value || "us";
  const category = categorySelect.value || "general";
  const searchText = inputSearch.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, "error-msg");
    return;
  }
  if (!res.articles.length) {
    showAlert("News not found", "error-msg");
    return;
  }
  renderNews(res.articles);
}

function clearContainer(container) {
  container.innerHTML = "";
}

function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";
  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}
const img =
  "https://www.mceducation.com/images/default-source/mce-news/marshall-cavendish-news---latest-news---1520x850b7e7eabbf5446f279943ff00005f5285.jpg?Status=Master&sfvrsn=5216aaae_0";

function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class = "col s12">
        <div class = "card medium">
            <div class = "card-image">
                <img src = "${
                  urlToImage || img
                }" onerror = "this.src = '${img}'">
                <span class = "card-title">${title || ""}</span>
            </div>
            <div class = "card-content">
                <p>${description || ""}</p>
            </div>
            <div class = "card-action">
                <a href = "${url}"> Read more</a>
            </div>
        </div>
    </div>`;
}


function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>    
  `
  );
}

function removePreloader() {
  const load = document.querySelector(".progress");
  if (load) {
    load.remove();
  }
}
