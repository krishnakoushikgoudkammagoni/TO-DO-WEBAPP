 let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

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
            if (task) {
                const newText = prompt('Edit your task:', task.text);
                if (newText && newText.trim() !== '') {
                    task.text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
            }
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
            
            div.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-time">
                        Added: ${task.createdAt}${task.completedAt ? ` | Completed: ${task.completedAt}` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="${isCompleted ? 'undo' : 'complete'}" onclick="toggleTask(${task.id})">
                        ${isCompleted ? 'Undo' : 'Complete'}
                    </button>
                    <button class="edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;
            
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