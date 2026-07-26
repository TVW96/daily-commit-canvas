const gallery = document.querySelector("#gallery");
const dateFilter = document.querySelector("#date-filter");
const monthFilter = document.querySelector("#month-filter");
const repositoryFilter = document.querySelector("#repository-filter");
const clearFilters = document.querySelector("#clear-filters");
const showAll = document.querySelector("#show-all");
const emptyState = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");
const modal = document.querySelector("#asset-modal");
const modalContent = document.querySelector("#modal-content");
const modalClose = document.querySelector("#modal-close");

let entries = [];

function displayDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(new Date(`${date}T12:00:00-07:00`));
}

function displayDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(new Date(value));
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
  const card = document.createElement("button");
  card.type = "button";
  card.className = "asset-card";
  card.setAttribute("aria-label", `Open details for ${entry.assetType} from ${entry.repository}`);
  card.addEventListener("click", () => openModal(entry));

  const visual = document.createElement("div");
  visual.className = `asset-visual${entry.transparent ? " transparent" : ""}`;

  const image = document.createElement("img");
  image.src = entry.image;
  image.alt = `${entry.assetType} for ${entry.repository}`;
  image.loading = "lazy";
  visual.append(image);
  appendTextElement(visual, "span", String(index + 1).padStart(2, "0"), "asset-number");

  const peek = document.createElement("div");
  peek.className = "card-peek";
  appendTextElement(peek, "span", displayDate(entry.date), "peek-date");
  appendTextElement(peek, "strong", entry.repository);
  appendTextElement(
    peek,
    "span",
    `${entry.assetType} · ${entry.versionLabel || "v01"}`,
    "peek-type",
  );

  card.append(visual, peek);
  return card;
}

function addModalField(parent, label, value) {
  const group = document.createElement("div");
  group.className = "modal-field";
  appendTextElement(group, "dt", label);
  appendTextElement(group, "dd", value || "Not recorded");
  parent.append(group);
}

function openModal(entry) {
  const layout = document.createElement("div");
  layout.className = "modal-layout";

  const visual = document.createElement("div");
  visual.className = `modal-visual${entry.transparent ? " transparent" : ""}`;
  const image = document.createElement("img");
  image.src = entry.image;
  image.alt = `${entry.assetType} for ${entry.repository}`;
  visual.append(image);

  const details = document.createElement("div");
  details.className = "modal-details";
  appendTextElement(details, "p", `${displayDate(entry.date)} · ${entry.format}`, "eyebrow");
  const title = appendTextElement(details, "h2", entry.repository);
  title.id = "modal-title";
  appendTextElement(details, "p", entry.fullDescription || entry.commitSummary, "modal-description");

  const facts = document.createElement("dl");
  facts.className = "modal-facts";
  addModalField(facts, "Commit signal", entry.commitSummary);
  addModalField(facts, "Archetype", entry.archetype);
  addModalField(facts, "Revision", entry.versionLabel || `v${String(entry.revision || 1).padStart(2, "0")}`);
  addModalField(facts, "Asset", entry.assetType);
  addModalField(facts, "Dimensions", entry.dimensions);
  addModalField(facts, "Creative rationale", entry.creativeRationale);
  addModalField(facts, "Generation method", entry.generationMethod);
  addModalField(facts, "Agent / LLM", entry.agentModel);
  addModalField(facts, "Image model", entry.imageModel);

  const promptHeading = appendTextElement(details, "h3", "Firefly prompt");
  promptHeading.className = "modal-section-title";
  appendTextElement(details, "pre", entry.fireflyPrompt || "The exact prompt was not captured in the original generation record.", "prompt");

  const citationHeading = appendTextElement(details, "h3", "Research citations");
  citationHeading.className = "modal-section-title";
  const citations = document.createElement("ul");
  citations.className = "citations";
  const sources = entry.researchCitations?.length
    ? entry.researchCitations
    : [{ label: "No external research used; generation was grounded in repository source.", url: entry.repositoryUrl }];
  sources.forEach((source) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${source.label} ↗`;
    item.append(link);
    citations.append(item);
  });

  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const repositoryLink = document.createElement("a");
  repositoryLink.href = entry.repositoryUrl;
  repositoryLink.target = "_blank";
  repositoryLink.rel = "noreferrer";
  repositoryLink.textContent = "View repository ↗";
  const download = document.createElement("a");
  download.href = entry.image;
  download.download = "";
  download.textContent = `Download ${entry.format} ↓`;
  actions.append(repositoryLink, download);

  details.append(facts, promptHeading, details.querySelector(".prompt"), citationHeading, citations, actions);
  layout.append(visual, details);
  modalContent.replaceChildren(layout);
  modal.showModal();
}

function resetFilters() {
  dateFilter.value = "";
  monthFilter.value = "";
  repositoryFilter.value = "";
  render();
}

function render() {
  const visibleEntries = entries.filter(
    (entry) =>
      (!dateFilter.value || entry.date === dateFilter.value) &&
      (!monthFilter.value || entry.month === monthFilter.value) &&
      (!repositoryFilter.value || entry.repository === repositoryFilter.value),
  );

  gallery.replaceChildren(
    ...visibleEntries.map((entry, index) => createCard(entry, index)),
  );

  resultCount.textContent = `${visibleEntries.length} ${
    visibleEntries.length === 1 ? "asset" : "assets"
  }`;
  gallery.hidden = visibleEntries.length === 0;
  emptyState.hidden = visibleEntries.length !== 0;
  clearFilters.disabled =
    !dateFilter.value && !monthFilter.value && !repositoryFilter.value;
}

async function initialize() {
  const [entriesResponse, healthResponse] = await Promise.all([
    fetch("data/entries.json"),
    fetch("data/automation-health.json"),
  ]);
  if (!entriesResponse.ok) throw new Error("Could not load gallery data.");
  entries = await entriesResponse.json();

  const latestDate = entries.map((entry) => entry.date).sort().reverse()[0];
  const repositories = [...new Set(entries.map((entry) => entry.repository))].sort();

  document.querySelector("#latest-date").textContent = latestDate
    ? displayDate(latestDate)
    : "—";
  repositories.forEach((repository) => {
    const option = document.createElement("option");
    option.value = repository;
    option.textContent = repository;
    repositoryFilter.append(option);
  });

  if (healthResponse.ok) {
    const health = await healthResponse.json();
    document.querySelector("#last-success").textContent = displayDateTime(
      health.lastSuccessfulRun,
    );
    document.querySelector("#next-run").textContent = displayDateTime(
      health.nextScheduledRun,
    );
    document.querySelector("#run-mode").textContent =
      health.mode === "fallback" ? "Research fallback" : "GitHub activity";
    document.querySelector("#processed-count").textContent =
      `${health.repositoriesProcessed.length.toString().padStart(2, "0")} repos · ${health.actualAssetCount}/${health.expectedAssetCount} assets`;
    const healthStatus = document.querySelector("#health-status");
    healthStatus.textContent = health.partialFailure ? "Partial failure" : health.message;
    healthStatus.title = health.message;
    document.querySelector(".status").dataset.health = health.status;
  } else {
    document.querySelector("#health-status").textContent = "Health data unavailable";
    document.querySelector(".status").dataset.health = "unknown";
  }
  render();
}

dateFilter.addEventListener("input", render);
monthFilter.addEventListener("input", render);
repositoryFilter.addEventListener("change", render);
clearFilters.addEventListener("click", resetFilters);
showAll.addEventListener("click", resetFilters);
modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

initialize().catch((error) => {
  resultCount.textContent = error.message;
});
