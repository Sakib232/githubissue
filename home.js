
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
