if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "./login.html";
}

// API Configuration
const BASE_URL = "https://phi-lab-server.vercel.app/api/v1/lab";

const issuesContainer = document.getElementById("issuesContainer");
const issueCount = document.getElementById("issueCount");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const tabButtons = document.querySelectorAll(".tab-btn");

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

let allIssues = [];
let currentStatus = "all";

function showLoader() {
  loader.classList.remove("hidden");
  issuesContainer.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
  issuesContainer.classList.remove("hidden");
}

function showError(message) {
  issuesContainer.innerHTML = `
    <div class="col-span-full text-center py-10">
      <p class="text-red-400 text-sm font-medium">${message}</p>
    </div>
  `;
}

async function fetchAllIssues() {
  try {
    showLoader();

    const res = await fetch(`${BASE_URL}/issues`);

    if (!res.ok) {
      throw new Error("Failed to fetch issues");
    }

    const data = await res.json();
    allIssues = data?.data || data || [];

    renderIssues(filterIssues(allIssues, currentStatus));
  } catch (error) {
    showError("Failed to fetch issues. Please try again.");
  } finally {
    hideLoader();
  }
}

function filterIssues(issues, status) {
  if (status === "all") return issues;
  return issues.filter((issue) => issue.status?.toLowerCase() === status);
}

function setActiveTab(activeStatus) {
  tabButtons.forEach((btn) => {
    if (btn.dataset.status === activeStatus) {
      btn.className =
        "tab-btn bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium";
    } else {
      btn.className =
        "tab-btn bg-gray-100 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium";
    }
  });
}


function getBorderColor(status) {
  return status?.toLowerCase() === "open"
    ? "border-t-[#20C997]"
    : "border-t-[#B26BFF]";
}

function getStatusBadge(status) {
  const currentStatus = status?.toLowerCase();

  if (currentStatus === "open") {
    return `
      <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        OPEN
      </span>
    `;
  }

  return `
    <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
      <span class="w-2 h-2 rounded-full bg-violet-500"></span>
      CLOSED
    </span>
  `;
}

function getPriorityBadge(priority) {
  const p = priority?.toLowerCase();

  if (p === "high") {
    return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#FDECEC] text-[#F05D5E]">HIGH</span>`;
  }

  if (p === "medium") {
    return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#FFF4D6] text-[#D9A400]">MEDIUM</span>`;
  }

  if (p === "low") {
    return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#F1F3F5] text-[#9AA1A9]">LOW</span>`;
  }

  return `<span class="text-[9px] font-semibold px-3 py-1 rounded-full bg-[#F1F3F5] text-[#9AA1A9]">N/A</span>`;
}

function getLabelBadges(labelInput) {
  const labels = Array.isArray(labelInput) ? labelInput : [labelInput];

  const labelConfig = {
    bug: {
      bg: "bg-red-50",
      text: "text-red-500",
      border: "border border-red-200",
      icon: "🚨",
    },
    enhancement: {
      bg: "bg-green-50",
      text: "text-green-500",
      border: "border border-green-200",
      icon: "✨",
    },
    "good first issue": {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border border-yellow-200",
      icon: "🏷️",
    },
    "help wanted": {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border border-yellow-200",
      icon: "🤝",
    },
    documentation: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      border: "border border-blue-200",
      icon: "📘",
    },
    wontfix: {
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border border-gray-200",
      icon: "⛔",
    },
  };

  return labels
    .map((label) => {
      if (!label || label.toLowerCase() === "no label") {
        return `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-200">
            ⚪ NO LABEL
          </span>
        `;
      }

      const lowerLabel = label.toLowerCase();
      const config = labelConfig[lowerLabel] || {
        bg: "bg-indigo-50",
        text: "text-indigo-500",
        border: "border border-indigo-200",
        icon: "🏷️",
      };

      return `
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${config.bg} ${config.text} ${config.border}">
          <span class="text-[10px]">${config.icon}</span>
          <span>${label}</span>
        </span>
      `;
    })
    .join(" ");
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}

function renderIssues(issues) {
  issueCount.textContent = issues.length;

  if (!issues.length) {
    issuesContainer.innerHTML = `
      <p class="col-span-full text-center text-gray-400 py-10">No issues found.</p>
    `;
    return;
  }

  issuesContainer.innerHTML = issues
    .map((issue, index) => {
      const title = issue.title || "No Title";
      const description = issue.description || "No Description";
      const status = issue.status || "Unknown";
      const author = issue.author || issue.createdBy || "Unknown";
      const priority = issue.priority || "N/A";
      const label = issue.labels && issue.labels.length > 0 
        ? issue.labels.join(", ") 
        : "No Label";
      const createdAt = formatDate(issue.createdAt);
      const id = issue.id || issue._id;

      return `
        <div
          onclick="openIssueModal('${id}')"
          class="bg-white rounded-xl border border-[#E9ECEF] border-t-[3px] ${getBorderColor(status)} shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between cursor-pointer min-h-fit"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-4 h-4 rounded-full flex items-center justify-center ${
                status?.toLowerCase() === "open"
                  ? "bg-[#E9FBF1]"
                  : "bg-[#F3E8FF]"
              }">
                <div class="w-2 h-2 rounded-full ${
                  status?.toLowerCase() === "open"
                    ? "bg-[#19B36B]"
                    : "bg-[#B26BFF]"
                }"></div>
              </div>

              ${getPriorityBadge(priority)}
            </div>

            <h3 class="text-[13px] font-semibold leading-[16px] text-[#1F2937] mb-2 line-clamp-2">
              ${title}
            </h3>

            <p class="text-[11px] leading-[14px] text-[#9CA3AF] mb-4 line-clamp-2">
              ${description}
            </p>

            <div class="flex flex-wrap gap-2 mb-4">
              ${getLabelBadges(label)}
            </div>
          </div>

          <div class="pt-3 border-t border-[#F1F3F5] mt-auto">
            <p class="text-[10px] text-[#9CA3AF] mb-1 line-clamp-1">#${index + 1} by ${author}</p>
            <p class="text-[10px] text-[#9CA3AF]">${createdAt}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

async function openIssueModal(id) {
  try {
    const res = await fetch(`${BASE_URL}/issue/${id}`);

    if (!res.ok) {
      throw new Error("Failed to fetch single issue");
    }

    const data = await res.json();
    const issue = data?.data || data;

    modalContent.innerHTML = `
      <h2 class="text-2xl font-bold mb-4 text-gray-800">${issue.title || "No Title"}</h2>

      <div class="flex flex-wrap gap-3 mb-5">
        ${getStatusBadge(issue.status || "Unknown")}
        ${getPriorityBadge(issue.priority || "N/A")}
        ${getLabelBadges(issue.label || "No Label")}
      </div>

      <p class="text-gray-500 mb-6 leading-7">
        ${issue.description || "No Description"}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="bg-gray-50 rounded-xl p-4">
          <p><span class="font-semibold text-gray-700">Author:</span> ${issue.author || issue.createdBy || "Unknown"}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4">
          <p><span class="font-semibold text-gray-700">Created At:</span> ${formatDate(issue.createdAt)}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4">
          <p><span class="font-semibold text-gray-700">Status:</span> ${issue.status || "Unknown"}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4">
          <p><span class="font-semibold text-gray-700">Priority:</span> ${issue.priority || "N/A"}</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 md:col-span-2">
          <p><span class="font-semibold text-gray-700">Label:</span> ${issue.label || "No Label"}</p>
        </div>
      </div>
    `;

    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("flex");
  } catch (error) {
    showError("Failed to load issue details");
  }
}

closeModal.addEventListener("click", () => {
  modalOverlay.classList.add("hidden");
  modalOverlay.classList.remove("flex");
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex");
  }
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentStatus = btn.dataset.status;
    setActiveTab(currentStatus);
    renderIssues(filterIssues(allIssues, currentStatus));
  });
});

searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    renderIssues(filterIssues(allIssues, currentStatus));
    return;
  }

  try {
    showLoader();

    const res = await fetch(`${BASE_URL}/issues/search?q=${encodeURIComponent(query)}`);

    if (!res.ok) {
      throw new Error("Search request failed");
    }

    const data = await res.json();
    const searchedIssues = data?.data || data || [];

    renderIssues(filterIssues(searchedIssues, currentStatus));
  } catch (error) {
    showError("Search failed. Please try again.");
  } finally {
    hideLoader();
  }
}

fetchAllIssues();
setActiveTab("all");




