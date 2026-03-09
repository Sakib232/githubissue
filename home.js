
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

function getLabelBadges(label) {
    if (!label || label.toLowerCase() === "no label") {
        return `
            <span class="text-[9px] font-semibold px-2 py-1 rounded-full bg-[#F4F5F7] text-[#9AA1A9]"># NO LABEL</span>
        `;
    }

    const l = label.toLowerCase();

    if (l === "bug") {
        return `<span class="text-[9px] font-semibold px-2 py-1 rounded-full bg-[#FDECEC] text-[#E96A6A]"># BUG</span>`;
    }

    if (l === "enhancement") {
        return `<span class="text-[9px] font-semibold px-2 py-1 rounded-full bg-[#E9FBF1] text-[#19B36B]"># ENHANCEMENT</span>`;
    }

    if (l === "help wanted") {
        return `<span class="text-[9px] font-semibold px-2 py-1 rounded-full bg-[#FFF4D6] text-[#D9A400]"># HELP WANTED</span>`;
    }

    return `<span class="text-[9px] font-semibold px-2 py-1 rounded-full bg-[#F4F5F7] text-[#9AA1A9]"># ${label.toUpperCase()}</span>`;
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
      const label = issue.label || "No Label";
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