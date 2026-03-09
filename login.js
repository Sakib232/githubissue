const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "admin" && password === "admin123") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "./main.html";
  } else {
    loginError.textContent = "Invalid credentials. Use admin / admin123";
  }
});