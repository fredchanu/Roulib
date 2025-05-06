document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const userType = document.getElementById("user-type").value;
  
    fetch("users.json")
      .then(res => res.json())
      .then(users => {
        const user = users.find(u => u.email === email && u.password === password && u.type === userType);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          if (user.type === "client") {
            window.location.href = "client.html";
          } else if (user.type === "pro") {
            window.location.href = "dashboard.html";
          }
        } else {
          document.getElementById("error-message").classList.remove("hidden");
        }
      });
  });
  