var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var xPlot = function(d) {
    return new Date(d.timestamp);
};

var lastTotal = 0;
var yPlot = function(d) {
    var total = d.total / 100;
    if (lastTotal === 0)
        lastTotal = total;
    var diff = total - lastTotal;
    lastTotal = total;
    if(diff < 0)
        diff = 0;

    return diff;
};

var line = d3.svg.line()
    .x(function(d) { return x(xPlot(d)); })
    .y(function(d) { return y(yPlot(d)); });

var svg = d3.select(".line-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function renderLine(data) {
  x.domain(d3.extent(data, xPlot));
  y.domain(d3.extent(data, yPlot));

  lastTotal = 0;

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Donation ($)");

  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", line);
}

function updateLine(data, duration) {
  x.domain(d3.extent(data, xPlot))
  y.domain(d3.extent(data, yPlot));

  lastTotal = 0;

  var svg = d3.select(".line-chart svg")

  svg.select(".x.axis")
    .transition()
    .duration(duration)
    .call(xAxis);

  svg.select(".y.axis")
    .transition()
    .duration(duration)
    .call(yAxis);

  svg.select(".line")
    .data([data])
    .transition()
    .duration(duration)
    .attr("d", line);
}

d3.json("sanders_nh.json", function(error, data) {
  if (error) throw error;

  var start = 0;
  var cursor = 10;
  var duration = 100;
  renderLine(data.slice(start, start+cursor));

  var intervalTimer = setInterval(function() {
      if(++cursor > data.length)
          return clearInterval(intervalTimer);

    var records = data.slice(start, start+cursor);
    updateLine(records, duration);
  }, duration);

});
