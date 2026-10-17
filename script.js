const STORAGE_KEY = "tasks";

let tasks = [];
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  tasks = Array.isArray(saved) ? saved : [];
} catch {
  tasks = [];
}

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");

function getCurrentDateTime() {
  return new Date().toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#ff929c" : "";
}

function addTask(event) {
  if (event) event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    showMessage("Add a task description first.", true);
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    text,
    completed: false,
    createdAt: getCurrentDateTime()
  });
  saveTasks();
  taskInput.value = "";
  showMessage("Task added. You've got this!");
  renderTasks();
  taskInput.focus();
}

function deleteTask(id) {
  const task = tasks.find(item => String(item.id) === String(id));
  if (!task) return;
  tasks = tasks.filter(item => String(item.id) !== String(id));
  saveTasks();
  showMessage("Task deleted.");
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(item => String(item.id) === String(id));
  if (!task) return;
  task.completed = !task.completed;
  if (task.completed) task.completedAt = getCurrentDateTime();
  else delete task.completedAt;
  saveTasks();
  showMessage(task.completed ? "Nicely done — task completed!" : "Task moved back to pending.");
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => String(item.id) === String(id));
  if (!task) return;
  const updatedText = prompt("Edit your task:", task.text);
  if (updatedText === null) return;
  if (!updatedText.trim()) {
    showMessage("A task cannot be empty.", true);
    return;
  }
  task.text = updatedText.trim();
  saveTasks();
  showMessage("Task updated.");
  renderTasks();
}

function createTaskElement(task, isCompleted) {
  const item = document.createElement("article");
  item.className = `task-item${isCompleted ? " completed-task" : ""}`;

  const check = document.createElement("button");
  check.className = "task-check";
  check.type = "button";
  check.setAttribute("aria-label", isCompleted ? "Move task back to pending" : "Mark task completed");
  check.title = check.getAttribute("aria-label");
  check.textContent = isCompleted ? "✓" : "";
  check.addEventListener("click", () => toggleTask(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const text = document.createElement("div");
  text.className = "task-text";
  text.textContent = task.text;

  const time = document.createElement("div");
  time.className = "task-time";
  time.textContent = `Added ${task.createdAt || "date unavailable"}${task.completedAt ? " · Completed " + task.completedAt : ""}`;

  content.append(text, time);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const edit = document.createElement("button");
  edit.className = "icon-button edit";
  edit.type = "button";
  edit.title = "Edit task";
  edit.setAttribute("aria-label", "Edit task");
  edit.textContent = "✎";
  edit.addEventListener("click", () => editTask(task.id));

  const remove = document.createElement("button");
  remove.className = "icon-button delete";
  remove.type = "button";
  remove.title = "Delete task";
  remove.setAttribute("aria-label", "Delete task");
  remove.textContent = "×";
  remove.addEventListener("click", () => deleteTask(task.id));

  actions.append(edit, remove);
  item.append(check, content, actions);
  return item;
}

function renderEmpty(container, heading, description) {
  const empty = document.createElement("div");
  empty.className = "empty-message";
  empty.innerHTML = `<span class="empty-symbol">✧</span><strong>${escapeHtml(heading)}</strong><span>${escapeHtml(description)}</span>`;
  container.appendChild(empty);
}

function renderTasks() {
  const pendingList = document.getElementById("pendingList");
  const completedList = document.getElementById("completedList");
  const query = searchInput.value.trim().toLowerCase();

  pendingList.replaceChildren();
  completedList.replaceChildren();

  const pending = tasks.filter(task => !task.completed);
  const completed = tasks.filter(task => task.completed);
  const filteredPending = pending.filter(task => task.text.toLowerCase().includes(query));
  const filteredCompleted = completed.filter(task => task.text.toLowerCase().includes(query));

  if (filteredPending.length) filteredPending.forEach(task => pendingList.appendChild(createTaskElement(task, false)));
  else renderEmpty(pendingList, query ? "No matching tasks" : "All clear for now", query ? "Try a different search." : "Add a task above to get started.");

  if (filteredCompleted.length) filteredCompleted.forEach(task => completedList.appendChild(createTaskElement(task, true)));
  else renderEmpty(completedList, query ? "No matching tasks" : "Your wins will show up here", query ? "Try a different search." : "Complete a task and it will appear here.");

  const total = tasks.length;
  const completedCount = completed.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending.length;
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("progressPercent").textContent = percent;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("pendingPill").textContent = pending.length;
  document.getElementById("completedPill").textContent = completedCount;
}

taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", renderTasks);
document.addEventListener("keydown", event => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short", month: "short", day: "numeric"
});

renderTasks();