var Chart = require("chart.js")
console.log("aasdalks;ask;dlasl;dkal;sdk")
var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ["a","b","c","d","e","f","g"],
		datasets: [{
			label: 'Temparature',
			data: [0, 19, 3, 5, 2, 3, 16],
			backgroundColor : 'rgba(255,99,132,0.2)'
		}]
	},
	options: {}
});