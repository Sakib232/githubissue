
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