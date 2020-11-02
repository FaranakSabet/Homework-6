const API_KEY = "2192a0294b75814f80b390e756fb8a65";

$(document).ready(() => {

  
  let history = JSON.parse(window.localStorage.getItem("history")) || [];

  $("#search-button").on("click", () => {
    let query = $("#search-value").val();

    $("#search-value").val("");

    fetchWeather(query);

    // add to weather list
    listCities(query)

  });

  $(".history").on("click", "li", function () {
    fetchWeather($(this).text());
  });

  const listCities = (text) => {
    let li = $("<li>")
      .addClass("list-group-item list-group-item-action")
      .text(text);
    $(".history").append(li);
  };

  const fetchWeather = (searchValue) => {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${API_KEY}`,
      dataType: "json",
      success: (data) => {
        console.log(data);
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
        }
        $("#today").empty();

        const title = $("<h3>")
          .addClass("card-title")
          .text(data.name + " (" + new Date().toLocaleDateString() + ")");
        const card = $("<div>").addClass("card");
        const wind = $("<p>")
          .addClass("card-text")
          .text("Wind Speed: " + data.wind.speed + " MPH");
        const humid = $("<p>")
          .addClass("card-text")
          .text("Humidity: " + data.main.humidity + "%");
        const temp = $("<p>")
          .addClass("card-text")
          .text("Temperature: " + data.main.temp + " °F");
        const body = $("<div>").addClass("card-body");
        const img = $("<img>").attr(
          "src",
          `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
        );

        title.append(img);
        body.append(title, temp, humid, wind);
        card.append(body);
        $("#today").append(card);

        fetchForecast(searchValue);
        fetchUVIndex(data.coord.lat, data.coord.lon);
      },
    });
  };

  const fetchForecast = (searchValue) => {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=${API_KEY}`,
      dataType: "json",
      success: (data) => {
        $("#forecast")
          .html('<h4 class="mt-3">5-Day Forecast:</h4>')
          .append('<div class="row">');

        data.list.forEach((value) => {
          if (value.dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            let col = $("<div>").addClass("col-md-2");
            let card = $("<div>").addClass("card bg-primary text-white");
            let body = $("<div>").addClass("card-body p-2");

            let title = $("<h5>")
              .addClass("card-title")
              .text(new Date(value.dt_txt).toLocaleDateString());

            let image = $("<img>").attr(
              "src",
              "http://openweathermap.org/img/w/" +
                value.weather[0].icon +
                ".png"
            );

            let p1 = $("<p>")
              .addClass("card-text")
              .text("Temp: " + value.main.temp_max + " °F");
            let p2 = $("<p>")
              .addClass("card-text")
              .text("Humidity: " + value.main.humidity + "%");

            col.append(card.append(body.append(title, image, p1, p2)));
            $("#forecast .row").append(col);
          }
        });
      },
    });

    
  };

  const fetchUVIndex = (lat, lon) => {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${lat}&lon=${lon}`,
      dataType: "json",
      success: (data) => {
        let uv = $("<p>").text("UV Index: ");
        let btn = $("<span>").addClass("btn btn-sm").text(data.value);

        if (data.value < 3) {
          btn.addClass("btn-success");
        } else if (data.value < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uv.append(btn));
      },
    });
  };

  // UPDATE HISTORY
  const updateHistory = () => {
  
    
    console.log('history', history)
  
    if (history.length > 0) {
      fetchWeather(history[history.length - 1]);
    }
  
    history.forEach((h) => listCities(h));
  }

  updateHistory()

  
});


