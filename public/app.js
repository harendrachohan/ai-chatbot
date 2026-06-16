const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  
  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar", sender === "user" ? "user-avatar-msg" : "bot-avatar-msg");
  avatar.textContent = sender === "user" ? "👤" : "🤖";
  
  const content = document.createElement("div");
  content.classList.add("message-content");
  content.innerHTML = formatMessage(text);
  
  div.appendChild(avatar);
  div.appendChild(content);
  chatBox.appendChild(div);
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function formatMessage(text) {
  // Convert markdown to HTML
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/## (.*)/g, '<h2>$1</h2>')
    // Code blocks
    .replace(/```(\w+)?\n(.*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\d\. (.*)/g, '<li>$1</li>')
    .replace(/^\- (.*)/g, '<li>$1</li>')
    // Paragraphs
    .replace(/\n/g, '<br>');
}

function showLoading() {
  const div = document.createElement("div");
  div.classList.add("message", "bot-message");
  div.id = "loading-message";
  
  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar", "bot-avatar-msg");
  avatar.textContent = "🤖";
  
  const content = document.createElement("div");
  content.classList.add("message-content");
  content.innerHTML = '<div class="loading"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
  
  div.appendChild(avatar);
  div.appendChild(content);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoading() {
  const loading = document.getElementById("loading-message");
  if (loading) loading.remove();
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  addMessage(message, "user");
  messageInput.value = "";
  showLoading();

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    hideLoading();
    
    if (data.reply) {
      addMessage(data.reply, "bot");
    }
  } catch (error) {
    hideLoading();
    addMessage("Error connecting to server. Please try again.", "bot");
  }
});