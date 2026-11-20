let tasks = [];
try {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    console.error('Could not read saved tasks:', error);
}

let editingTaskId = null;

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('todo-theme');

document.body.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
if (themeToggle) {
    themeToggle.checked = savedTheme === 'dark';
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';
        document.body.dataset.theme = theme;
        localStorage.setItem('todo-theme', theme);
    });
}

function getCurrentDateTime() {
    return new Date().toLocaleString('en-US', {
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

    if (!text) {
        alert('Please enter a task!');
        return;
    }

    tasks.push({
        id: Date.now(),
        text,
        completed: false,
        createdAt: getCurrentDateTime()
    });

    saveTasks();
    input.value = '';
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => String(task.id) !== String(id));
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(item => String(item.id) === String(id));
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
        task.completedAt = getCurrentDateTime();
    } else {
        delete task.completedAt;
    }

    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(item => String(item.id) === String(id));
    if (!task) return;

    editingTaskId = task.id;
    renderTasks();

    const input = document.querySelector('.task-edit-input');
    if (input) {
        input.focus();
        input.select();
    }
}

function saveTaskEdit(id, input) {
    const task = tasks.find(item => String(item.id) === String(id));
    const text = input.value.trim();

    if (!task || !text) {
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

function createActionButton(label, className, action, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = className;
    button.addEventListener('click', onClick);
    return button;
}

function createTaskElement(task, isCompleted = false) {
    const div = document.createElement('div');
    div.className = `task-item ${isCompleted ? 'completed-task' : ''}`;

    const content = document.createElement('div');
    content.className = 'task-content';

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const isEditing = String(editingTaskId) === String(task.id);

    if (isEditing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.setAttribute('aria-label', 'Edit task');
        input.value = task.text || '';
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') saveTaskEdit(task.id, input);
            if (event.key === 'Escape') cancelTaskEdit();
        });
        content.appendChild(input);

        actions.appendChild(createActionButton('Save', 'complete', 'save', () => saveTaskEdit(task.id, input)));
        actions.appendChild(createActionButton('Cancel', 'edit', 'cancel', cancelTaskEdit));
    } else {
        const taskText = document.createElement('div');
        taskText.className = 'task-text';
        taskText.textContent = task.text || '';
        content.appendChild(taskText);

        const taskTime = document.createElement('div');
        taskTime.className = 'task-time';
        taskTime.textContent = `Added: ${task.createdAt || 'Unknown'}${task.completedAt ? ` | Completed: ${task.completedAt}` : ''}`;
        content.appendChild(taskTime);

        actions.appendChild(createActionButton(
            isCompleted ? 'Undo' : 'Complete',
            isCompleted ? 'undo' : 'complete',
            'toggle',
            () => toggleTask(task.id)
        ));
        actions.appendChild(createActionButton('Edit', 'edit', 'edit', () => editTask(task.id)));
        actions.appendChild(createActionButton('Delete', 'delete', 'delete', () => deleteTask(task.id)));
    }

    div.append(content, actions);
    return div;
}

function renderTasks() {
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    if (!pendingList || !completedList) return;

    pendingList.replaceChildren();
    completedList.replaceChildren();

    const pending = tasks.filter(task => !task.completed);
    const completed = tasks.filter(task => task.completed);

    if (pending.length === 0) {
        pendingList.innerHTML = '<div class="empty-message">No pending tasks</div>';
    } else {
        pending.forEach(task => pendingList.appendChild(createTaskElement(task)));
    }

    if (completed.length === 0) {
        completedList.innerHTML = '<div class="empty-message">No completed tasks</div>';
    } else {
        completed.forEach(task => completedList.appendChild(createTaskElement(task, true)));
    }
}

document.getElementById('taskInput').addEventListener('keydown', event => {
    if (event.key === 'Enter') addTask();
});

const addTaskButton = document.getElementById('addTaskButton');
if (addTaskButton) {
    addTaskButton.addEventListener('click', addTask);
}

renderTasks();

const introDialog = document.getElementById('introDialog');
if (introDialog && typeof introDialog.showModal === 'function' && !introDialog.open) {
    introDialog.showModal();
}
