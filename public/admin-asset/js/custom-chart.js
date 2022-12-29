(function ($) {
  let price = [];
  ("use strict");
  $.ajax({
    url: "/admin/test",

    method: "get",
    success: (response) => {
      // console.log(response);
      for (i = 1; i <= 30; i++) {
        for (j = 0; j < 30; j++) {
          if (response[j]?._id == i) {
            console.log(i);
            price[i] = response[j]?.totalAmount;
            console.log(price[i]);
            break;
          } else {
            price[i] = 0;
          }
        }
      }
      console.log(price[7]);
      if ($("#myChart").length) {
        var ctx = document.getElementById("myChart").getContext("2d");
        var chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
              "13",
              "14",
              "15",
              "17",
              "18",
              "19",
              "20",
              "21",
              "22",
              "23",
              "24",
              "25",
              "26",
              "27",
              "28",
              "29",
              "30",
              "31",
            ],
            datasets: [
              {
                label: "Daily Sales",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(150, 214, 154)",
                borderColor: "rgba(30, 199, 40)",
                data: [
                  price[1],
                  price[2],
                  price[3],
                  price[4],
                  price[5],
                  price[6],
                  price[7],
                  price[8],
                  price[9],
                  price[10],
                  price[11],
                  price[12],
                  price[13],
                  price[14],
                  price[15],
                  price[16],
                  price[17],
                  price[18],
                  price[19],
                  price[20],
                  price[21],
                  price[22],
                  price[23],
                  price[24],
                  price[25],
                  price[26],
                  price[27],
                  price[28],
                  price[29],
                  price[30],
                  price[31],
                ],
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      } //End if
    },
  });
  $.ajax({
    url: "/admin/test1",

    method: "get",
    success: (response) => {
      // console.log(response);
      let dateArray = response.date;
      let countArray = response.total;

      // console.log(dateArray, "hhahhaahaha", countArray);

      /daily visitors Chart/;
      if ($("#myChart4").length) {
        var ctx = document.getElementById("myChart4").getContext("2d");
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: "line",

          // The data for our dataset
          data: {
            labels: [
              dateArray[0],
              dateArray[1],
              dateArray[2],
              dateArray[3],
              dateArray[4],
              dateArray[5],
              dateArray[6],
              dateArray[7],
              dateArray[8],
              dateArray[9],
              dateArray[10],
              dateArray[11],
              dateArray[12],
              dateArray[13],
              dateArray[14],
              dateArray[15],
              dateArray[16],
              dateArray[17],
              dateArray[18],
              dateArray[19],
              dateArray[20],
              dateArray[21],
              dateArray[22],
              dateArray[23],
              dateArray[24],
              dateArray[25],
              dateArray[26],
              dateArray[27],
              dateArray[28],
              dateArray[29],
              dateArray[30],
            ],
            datasets: [
              {
                label: "Daily Visits",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(44, 120, 220, 0.2)",
                borderColor: "rgba(44, 120, 220)",

                data: [
                  countArray[0],
                  countArray[1],
                  countArray[2],
                  countArray[3],
                  countArray[4],
                  countArray[5],
                  countArray[6],
                  countArray[7],
                  countArray[8],
                  countArray[9],
                  countArray[10],
                  countArray[11],
                  countArray[12],
                  countArray[13],
                  countArray[14],
                  countArray[15],
                  countArray[16],
                  countArray[17],
                  countArray[18],
                  countArray[19],
                  countArray[20],
                  countArray[21],
                  countArray[22],
                  countArray[23],
                  countArray[24],
                  countArray[25],
                  countArray[26],
                  countArray[27],
                  countArray[28],
                  countArray[29],
                  countArray[30],
                  countArray[31],
                ],
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      } //End if
    },
  });
})(jQuery);
