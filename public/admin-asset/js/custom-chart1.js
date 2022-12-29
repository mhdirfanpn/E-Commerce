(function ($) {
  "use strict";
  let price = [];
  console.log("afjakfke");
  $.ajax({
    url: "/admin/test2",

    method: "get",
    success: (response) => {
      // console.log(response);
      let dateArray = response.date;
      let countArray = response.total;

      // console.log(dateArray, "hhahhaahaha", countArray);

      /Sale statistics Chart/;
      if ($("#myChart7").length) {
        var ctx = document.getElementById("myChart7").getContext("2d");
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
                label: "Orders",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(188, 105, 194)",
                borderColor: "rgba(115, 7, 122)",

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
