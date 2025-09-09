export function setLastActivity() {
  localStorage.setItem("lastActivity", Date.now().toString());
}

// подписка на активность пользователя
export function trackUserActivity() {
  const events = ["mousemove", "click", "keydown", "scroll"];
  events.forEach((event) => {
    window.addEventListener(event, setLastActivity);
  });
}
