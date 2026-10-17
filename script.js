  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingTaskId = null;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('todo-theme');

document.body.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
themeToggle.checked = savedTheme === 'dark';
themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    document.body.dataset.theme = theme;
    localStorage.setItem('todo-theme', theme);
});

        function getCurrentDateTime() {
            const now = new Date();
            return now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        function addTask() {
            const input = document.getElementById('taskInput');
            const text = input.value.trim();
            
            if (text === '') {
                alert('Please enter a task!');
                return;
            }

            const task = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: getCurrentDateTime()
            };

            tasks.push(task);
            saveTasks();
            input.value = '';
            renderTasks();
        }

        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                if (task.completed) {
                    task.completedAt = getCurrentDateTime();
                } else {
                    delete task.completedAt;
                }
                saveTasks();
                renderTasks();
            }
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            editingTaskId = id;
            renderTasks();

            const input = document.getElementById(`editInput-${id}`);
            input.focus();
            input.select();
        }

        function saveTaskEdit(id) {
            const task = tasks.find(t => t.id === id);
            const input = document.getElementById(`editInput-${id}`);
            const text = input.value.trim();

            if (!task || text === '') {
                input.focus();
                return;
            }

            task.text = text;
            editingTaskId = null;
            saveTasks();
            renderTasks();
        }

        function cancelTaskEdit() {
            editingTaskId = null;
            renderTasks();
        }

        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function renderTasks() {
            const pendingList = document.getElementById('pendingList');
            const completedList = document.getElementById('completedList');
            
            pendingList.innerHTML = '';
            completedList.innerHTML = '';

            const pending = tasks.filter(t => !t.completed);
            const completed = tasks.filter(t => t.completed);

            if (pending.length === 0) {
                pendingList.innerHTML = '<div class="empty-message">No pending tasks</div>';
            } else {
                pending.forEach(task => {
                    pendingList.appendChild(createTaskElement(task));
                });
            }

            if (completed.length === 0) {
                completedList.innerHTML = '<div class="empty-message">No completed tasks</div>';
            } else {
                completed.forEach(task => {
                    completedList.appendChild(createTaskElement(task, true));
                });
            }
        }

        function createTaskElement(task, isCompleted = false) {
            const div = document.createElement('div');
            div.className = `task-item ${isCompleted ? 'completed-task' : ''}`;
            const isEditing = editingTaskId === task.id;

            div.innerHTML = `
                <div class="task-content">
                    ${isEditing
                        ? `<input class="task-edit-input" id="editInput-${task.id}" type="text" aria-label="Edit task">`
                        : `<div class="task-text">${escapeHtml(task.text)}</div>
                           <div class="task-time">
                               Added: ${task.createdAt}${task.completedAt ? ` | Completed: ${task.completedAt}` : ''}
                           </div>`}
                </div>
                <div class="task-actions">
                    ${isEditing
                        ? `<button class="complete" onclick="saveTaskEdit(${task.id})">Save</button>
                           <button class="edit" onclick="cancelTaskEdit()">Cancel</button>`
                        : `<button class="${isCompleted ? 'undo' : 'complete'}" onclick="toggleTask(${task.id})">
                               ${isCompleted ? 'Undo' : 'Complete'}
                           </button>
                           <button class="edit" onclick="editTask(${task.id})">Edit</button>
                           <button class="delete" onclick="deleteTask(${task.id})">Delete</button>`}
                </div>
            `;

            if (isEditing) {
                const input = div.querySelector('.task-edit-input');
                input.value = task.text;
                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') saveTaskEdit(task.id);
                    if (event.key === 'Escape') cancelTaskEdit();
                });
            }
            
            return div;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        renderTasks();

        document.getElementById('introDialog').showModal();
