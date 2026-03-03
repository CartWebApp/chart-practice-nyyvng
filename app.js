// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const publisherSelect = document.getElementById("publisherSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const publishers = [...new Set(chartData.map(r => r.publisher))];

years.forEach(m => yearSelect.add(new Option(m, m)));
publishers.forEach(h => publisherSelect.add(new Option(h, h)));

yearSelect.value = years[0];
publisherSelect.value = publishers[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = Number(yearSelect.value);
  const publisher = publisherSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, publisher, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, publisher, metric }) {
  if (type === "bar") return barBySales(year, metric);
  if (type === "line") return lineOveryears(publisher, ["unitsM", "revenueUSD"]);
  if (type === "scatter") return scatterScoreVsShare(publisher);
  if (type === "doughnut") return doughnutReigonShare(year, publisher);
  if (type === "radar") return radarComparepublishers(year);
  return barBySales(year, metric);
}

// Task A: BAR — compare publishers for a given year
function barBySales(year, metric) {
  console.log( year, metric );
  const rows = chartData.filter(r => r.year == year);

  const labels = rows.map(r => r.publisher);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Sales comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Sales" } }
      }
    }
  };
}

// Task B: LINE — trend over years for one Sales (2 datasets)
function lineOveryears(publisher, metrics) {
  const rows = chartData.filter(r => r.publisher === publisher);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over years: ${publisher}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
}

// SCATTER — relationship between priceUSD and unitsM
function scatterScoreVsShare(publisher) {
  const rows = chartData.filter(r => r.publisher === publisher);

  const points = rows.map(r => ({ x: r.unitsM * 100 , y: r.priceUSD }));
  console.log(publisher, rows, points);
  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `unitsM vs priceUSD (${publisher})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does priceUSD affect unitsM? (${publisher})` }
      },
      scales: {
        x: { title: { display: true, text: "Thousand Units" } },
        y: { title: { display: true, text: "PriceUSD" } }
      }
    }
  };
}


// DOUGHNUT — member vs casual share for one publisher + year
function doughnutReigonShare(year, publisher) {
  const row = chartData.find(r => r.year === year && r.publisher === publisher);

  const member = Math.round(row.memberShare * 100);
  const casual = 100 - member;
  console.log(year, publisher);
  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${publisher} (${year})` }
      }
    }
  };
}

// RADAR — compare publishers across multiple metrics for one year
function radarComparepublishers(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["unitsM", "revenueUSD", "priceUSD", "reviewScore"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.publisher,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}