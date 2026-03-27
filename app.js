// ===== Todo App =====
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    // ===== DOM Elements =====
    init() {
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.prioritySelect = document.getElementById('priority-select');
        this.dueDateInput = document.getElementById('due-date');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.itemsCount = document.getElementById('items-count');
        this.totalTasks = document.getElementById('total-tasks');
        this.activeTasks = document.getElementById('active-tasks');
        this.completedTasks = document.getElementById('completed-tasks');
        this.completionRate = document.getElementById('completion-rate');
        this.themeToggle = document.getElementById('theme-toggle');

        this.loadTheme();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add todo
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.render();
            });
        });

        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    // ===== CRUD Operations =====
    addTodo() {
        const text = this.todoInput.value.trim();
        const priority = this.prioritySelect.value;
        const dueDate = this.dueDateInput.value;

        if (!text) return;

        const todo = {
            id: Date.now(),
            text,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.resetForm();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    // ===== Filtering =====
    getFilteredTodos() {
        const { todos, currentFilter } = this;

        switch (currentFilter) {
            case 'active':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            case 'high':
                return todos.filter(t => t.priority === 'high');
            case 'medium':
                return todos.filter(t => t.priority === 'medium');
            case 'low':
                return todos.filter(t => t.priority === 'low');
            default:
                return todos;
        }
    }

    // ===== Rendering =====
    render() {
        const filteredTodos = this.getFilteredTodos();
        this.renderTodos(filteredTodos);
        this.renderStats();
        this.renderEmptyState(filteredTodos);
        this.updateItemsCount();
    }

    renderTodos(todos) {
        this.todoList.innerHTML = '';

        todos.forEach(todo => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);
        });
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const isOverdue = this.isOverdue(todo);

        li.innerHTML = `
            <div class="checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 12l5 5L20 7"></path>
                </svg>
            </div>
            <div class="todo-content">
                <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                <div class="todo-meta">
                    <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                    ${todo.dueDate ? `
                        <span class="due-date ${isOverdue ? 'overdue' : ''}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <path d="M16 2v4M8 2v4M3 10h18"></path>
                            </svg>
                            ${this.formatDate(todo.dueDate)}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-delete" data-id="${todo.id}" title="Delete task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // Event listeners
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('click', () => this.toggleTodo(todo.id));

        const deleteBtn = li.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    renderStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.totalTasks.textContent = total;
        this.activeTasks.textContent = active;
        this.completedTasks.textContent = completed;
        this.completionRate.textContent = `${rate}%`;
    }

    renderEmptyState(todos) {
        if (todos.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
    }

    updateItemsCount() {
        const active = this.todos.filter(t => !t.completed).length;
        this.itemsCount.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
    }

    resetForm() {
        this.todoInput.value = '';
        this.prioritySelect.value = 'medium';
        this.dueDateInput.value = '';
        this.todoInput.focus();
    }

    // ===== LocalStorage =====
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    // ===== Theme =====
    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');

        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    // ===== Utilities =====
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    isOverdue(todo) {
        if (!todo.dueDate || todo.completed) return false;
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
