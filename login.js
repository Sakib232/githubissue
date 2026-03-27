const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

// beginner-friendly function name
function checkLoginCredentials(user, pass) {
  return user === "admin" && pass === "admin123";
}

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Beginner-friendly variable names
  const inputUser = document.getElementById("username").value.trim();
  const inputPass = document.getElementById("password").value.trim();

  if (checkLoginCredentials(inputUser, inputPass)) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "./home.html";
  } else {
    loginError.textContent = "Invalid credentials. Use admin / admin123";
  }
});