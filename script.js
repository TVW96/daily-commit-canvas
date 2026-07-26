const gallery = document.querySelector("#gallery");
const dateFilter = document.querySelector("#date-filter");
const monthFilter = document.querySelector("#month-filter");
const clearFilters = document.querySelector("#clear-filters");
const showAll = document.querySelector("#show-all");
const emptyState = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");

let entries = [];

function displayDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(new Date(`${date}T12:00:00-07:00`));
}

function appendTextElement(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function createDefinition(list, term, description) {
  const row = document.createElement("div");
  appendTextElement(row, "dt", term);
  appendTextElement(row, "dd", description);
  list.append(row);
}

function createCard(entry, index) {
  const card = document.createElement("article");
  card.className = "asset-card";

  const visual = document.createElement("div");
  visual.className = `asset-visual${entry.transparent ? " transparent" : ""}`;

  const image = document.createElement("img");
  image.src = entry.image;
  image.alt = `${entry.assetType} for ${entry.repository}`;
  image.loading = "lazy";
  visual.append(image);
  appendTextElement(visual, "span", String(index + 1).padStart(2, "0"), "asset-number");

  const info = document.createElement("div");
  info.className = "asset-info";

  const dateRow = document.createElement("div");
  dateRow.className = "asset-date";
  const time = appendTextElement(dateRow, "time", displayDate(entry.date));
  time.dateTime = entry.date;
  appendTextElement(dateRow, "span", entry.format, "asset-format");

  const heading = document.createElement("h3");
  const repositoryLink = document.createElement("a");
  repositoryLink.href = entry.repositoryUrl;
  repositoryLink.target = "_blank";
  repositoryLink.rel = "noreferrer";
  repositoryLink.textContent = `${entry.repository} ↗`;
  heading.append(repositoryLink);

  appendTextElement(info, "p", entry.commitSummary, "asset-summary");
  const summary = info.lastElementChild;

  const details = document.createElement("dl");
  createDefinition(details, "Archetype", entry.archetype);
  createDefinition(details, "Asset", entry.assetType);
  createDefinition(details, "Size", entry.dimensions);

  const cardFooter = document.createElement("div");
  cardFooter.className = "card-footer";
  const palette = document.createElement("div");
  palette.className = "palette";
  palette.setAttribute("aria-label", "Color palette");
  entry.palette.forEach((color) => {
    const swatch = document.createElement("span");
    swatch.style.backgroundColor = color;
    swatch.title = color;
    palette.append(swatch);
  });

  const download = document.createElement("a");
  download.className = "download";
  download.href = entry.image;
  download.download = "";
  download.textContent = `Download ${entry.format} ↓`;

  cardFooter.append(palette, download);
  info.replaceChildren(dateRow, heading, summary, details, cardFooter);
  card.append(visual, info);
  return card;
}

function resetFilters() {
  dateFilter.value = "";
  monthFilter.value = "";
  render();
}

function render() {
  const visibleEntries = entries.filter(
    (entry) =>
      (!dateFilter.value || entry.date === dateFilter.value) &&
      (!monthFilter.value || entry.month === monthFilter.value),
  );

  gallery.replaceChildren(
    ...visibleEntries.map((entry, index) => createCard(entry, index)),
  );

  resultCount.textContent = `${visibleEntries.length} ${
    visibleEntries.length === 1 ? "asset" : "assets"
  }`;
  gallery.hidden = visibleEntries.length === 0;
  emptyState.hidden = visibleEntries.length !== 0;
  clearFilters.disabled = !dateFilter.value && !monthFilter.value;
}

async function initialize() {
  const response = await fetch("data/entries.json");
  if (!response.ok) throw new Error("Could not load gallery data.");
  entries = await response.json();

  const latestDate = entries.map((entry) => entry.date).sort().reverse()[0];
  const repositoryCount = new Set(entries.map((entry) => entry.repository)).size;

  document.querySelector("#latest-date").textContent = latestDate
    ? displayDate(latestDate)
    : "—";
  document.querySelector("#repository-count").textContent = String(
    repositoryCount,
  ).padStart(2, "0");
  document.querySelector("#asset-count").textContent = String(entries.length).padStart(
    2,
    "0",
  );
  render();
}

dateFilter.addEventListener("input", render);
monthFilter.addEventListener("input", render);
clearFilters.addEventListener("click", resetFilters);
showAll.addEventListener("click", resetFilters);

initialize().catch((error) => {
  resultCount.textContent = error.message;
});
