if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "./login.html";
}

// API base URL
const API_BASE_URL = "https://phi-lab-server.vercel.app/api/v1/lab";

const issuesGrid = document.getElementById("issuesContainer");
const issueCountText = document.getElementById("issueCount");
const loaderPanel = document.getElementById("loader");
const searchBox = document.getElementById("searchInput");
const searchButton = document.getElementById("searchBtn");
const tabButtons = document.querySelectorAll(".tab-btn");

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const closeModalButton = document.getElementById("closeModal");

let issueList = [];
let selectedStatus = "all";

function showLoader() {
  loaderPanel.classList.remove("hidden");
  issuesGrid.classList.add("hidden");
}

function hideLoader() {
  loaderPanel.classList.add("hidden");
  issuesGrid.classList.remove("hidden");
}

function showError(message) {
  issuesGrid.innerHTML = `
    <div class="col-span-full text-center py-10">
      <p class="text-red-400 text-sm font-medium">${message}</p>
    </div>
  `;
}

async function fetchIssuesFromServer() {
  try {
    showLoader();
    const response = await fetch(`${API_BASE_URL}/issues`);

    if (!response.ok) {
      throw new Error("Server error while loading issues");
    }

    const data = await response.json();
    issueList = data?.data || data || [];
    renderIssues(filterIssuesByStatus(issueList, selectedStatus));
  } catch (error) {
    showError("Failed to fetch issues. Please try again.");
    console.error(error);
  } finally {
    hideLoader();
  }
}

function filterIssuesByStatus(issues, status) {
  if (status === "all") {
    return issues;
  }
  return issues.filter((item) => item.status?.toLowerCase() === status);
}

function activateTab(statusName) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.status === statusName;
    btn.className = isActive
      ? "tab-btn bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
      : "tab-btn bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium";
  });
}

function getIssueBorder(status) {
  return status?.toLowerCase() === "open" ? "border-t-[#20C997]" : "border-t-[#B26BFF]";
}

function getPriorityStyle(priority) {
  const value = (priority || "").toLowerCase();

  if (value === "high") return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#FDECEC] text-[#F05D5E]">HIGH</span>`;
  if (value === "medium") return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#FFF4D6] text-[#D9A400]">MEDIUM</span>`;
  if (value === "low") return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#F1F3F5] text-[#9AA1A9]">LOW</span>`;

  return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#F1F3F5] text-[#9AA1A9]">N/A</span>`;
}

function getLabelBadges(labelInput) {
  const labels = Array.isArray(labelInput) ? labelInput : [labelInput];

  const badgeData = {
    bug: {bg: "bg-red-50", text: "text-red-500", border: "border border-red-200", icon: "🚨"},
    enhancement: {bg: "bg-green-50", text: "text-green-500", border: "border border-green-200", icon: "✨"},
    "good first issue": {bg: "bg-yellow-50", text: "text-yellow-600", border: "border border-yellow-200", icon: "🏷️"},
    "help wanted": {bg: "bg-yellow-50", text: "text-yellow-600", border: "border border-yellow-200", icon: "🤝"},
    documentation: {bg: "bg-blue-50", text: "text-blue-500", border: "border border-blue-200", icon: "📘"},
    wontfix: {bg: "bg-gray-50", text: "text-gray-500", border: "border border-gray-200", icon: "⛔"},
  };

  return labels
    .map((label) => {
      if (!label || label.toLowerCase() === "no label") {
        return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200">⚪ NO LABEL</span>`;
      }

      const key = label.toLowerCase();
      const data = badgeData[key] || {bg: "bg-indigo-50", text: "text-indigo-500", border: "border border-indigo-200", icon: "🏷️"};

      return `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${data.bg} ${data.text} ${data.border}"><span class="text-[10px]">${data.icon}</span><span>${label}</span></span>`;
    })
    .join(" ");
}

function getStatusBadge(status) {
  const value = (status || "").toLowerCase();
  if (value === "open") {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-100"><span class="w-2 h-2 rounded-full bg-green-500"></span>OPEN</span>`;
  }
  return `<span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100"><span class="w-2 h-2 rounded-full bg-violet-500"></span>CLOSED</span>`;
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

function renderIssues(issues) {
  issueCountText.textContent = issues.length;

  if (!issues.length) {
    issuesGrid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">No issues found.</p>`;
    return;
  }

  issuesGrid.innerHTML = issues
    .map((issue, index) => {
      const title = issue.title || "No Title";
      const description = issue.description || "No Description";
      const status = issue.status || "Unknown";
      const author = issue.author || issue.createdBy || "Unknown";
      const priority = issue.priority || "N/A";
      const labels = issue.labels && issue.labels.length > 0 ? issue.labels.join(", ") : "No Label";
      const createdAt = formatDate(issue.createdAt);
      const id = issue.id || issue._id;

      return `<div onclick="openIssueModal('${id}')" class="bg-white rounded-xl border border-[#E9ECEF] border-t-[3px] ${getIssueBorder(status)} shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between cursor-pointer min-h-fit"><div><div class="flex items-center justify-between mb-3"><div class="w-4 h-4 rounded-full flex items-center justify-center ${status.toLowerCase() === "open" ? "bg-[#E9FBF1]" : "bg-[#F3E8FF]"}"><div class="w-2 h-2 rounded-full ${status.toLowerCase() === "open" ? "bg-[#19B36B]" : "bg-[#B26BFF]"}"></div></div>${getPriorityStyle(priority)}</div><h3 class="text-[13px] font-semibold leading-[16px] text-[#1F2937] mb-2 line-clamp-2">${title}</h3><p class="text-[11px] leading-[14px] text-[#9CA3AF] mb-4 line-clamp-2">${description}</p><div class="flex flex-wrap gap-2 mb-4">${getLabelBadges(labels)}</div></div><div class="pt-3 border-t border-[#F1F3F5] mt-auto"><p class="text-[10px] text-[#9CA3AF] mb-1 line-clamp-1">#${index + 1} by ${author}</p><p class="text-[10px] text-[#9CA3AF]">${createdAt}</p></div></div>`;
    })
    .join("");
}

async function openIssueModal(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/issue/${id}`);
    if (!response.ok) throw new Error("Failed to fetch issue");

    const data = await response.json();
    const issue = data?.data || data || {};

    modalContent.innerHTML = `<h2 class="text-2xl font-bold mb-4 text-gray-800">${issue.title || "No Title"}</h2><div class="flex flex-wrap gap-3 mb-5">${getStatusBadge(issue.status || "Unknown")}${getPriorityStyle(issue.priority || "N/A")}${getLabelBadges(issue.label || "No Label")}</div><p class="text-gray-500 mb-6 leading-7">${issue.description || "No Description"}</p><div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div class="bg-gray-50 rounded-xl p-4"><p><span class="font-semibold text-gray-700">Author:</span> ${issue.author || issue.createdBy || "Unknown"}</p></div><div class="bg-gray-50 rounded-xl p-4"><p><span class="font-semibold text-gray-700">Created At:</span> ${formatDate(issue.createdAt)}</p></div><div class="bg-gray-50 rounded-xl p-4"><p><span class="font-semibold text-gray-700">Status:</span> ${issue.status || "Unknown"}</p></div><div class="bg-gray-50 rounded-xl p-4"><p><span class="font-semibold text-gray-700">Priority:</span> ${issue.priority || "N/A"}</p></div><div class="bg-gray-50 rounded-xl p-4 md:col-span-2"><p><span class="font-semibold text-gray-700">Label:</span> ${issue.label || "No Label"}</p></div></div>`;

    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("flex");
  } catch (error) {
    showError("Failed to load issue details");
    console.error(error);
  }
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.classList.remove("flex");
}

closeModalButton.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

function initTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedStatus = btn.dataset.status;
      activateTab(selectedStatus);
      renderIssues(filterIssuesByStatus(issueList, selectedStatus));
    });
  });
}

async function handleSearch() {
  const query = searchBox.value.trim();
  if (!query) {
    renderIssues(filterIssuesByStatus(issueList, selectedStatus));
    return;
  }

  try {
    showLoader();
    const response = await fetch(`${API_BASE_URL}/issues/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    const searchResults = data?.data || data || [];

    renderIssues(filterIssuesByStatus(searchResults, selectedStatus));
  } catch (error) {
    showError("Search failed. Please try again.");
    console.error(error);
  } finally {
    hideLoader();
  }
}

searchButton.addEventListener("click", handleSearch);

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

initTabs();
fetchIssuesFromServer();
activateTab("all");




