document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const person1Input = document.getElementById('person1');
    const person2Input = document.getElementById('person2');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const addDebtBtn = document.getElementById('addDebt');
    const debtsContainer = document.getElementById('debtsContainer');
    const totalStats = document.getElementById('totalStats');
    
    // Загрузка долгов из localStorage
    let debts = JSON.parse(localStorage.getItem('friendsDebts')) || [];
    
    // Инициализация приложения
    renderDebts();
    updateStats();
    
    // Добавление нового долга
    addDebtBtn.addEventListener('click', function() {
        const person1 = person1Input.value.trim();
        const person2 = person2Input.value.trim();
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();
        
        if (!person1 || !person2 || isNaN(amount) || amount <= 0) {
            alert('Пожалуйста, заполните все поля корректно!');
            return;
        }
        
        const newDebt = {
            id: Date.now(),
            person1,
            person2,
            amount,
            description,
            date: new Date().toISOString(),
            settled: false
        };
        
        debts.push(newDebt);
        saveDebts();
        renderDebts();
        updateStats();
        
        // Очистка полей ввода
        person1Input.value = '';
        person2Input.value = '';
        amountInput.value = '';
        descriptionInput.value = '';
        person1Input.focus();
    });
    
    // Функция для сохранения долгов в localStorage
    function saveDebts() {
        localStorage.setItem('friendsDebts', JSON.stringify(debts));
    }
    
    // Функция для отображения списка долгов
    function renderDebts() {
        debtsContainer.innerHTML = '';
        
        if (debts.length === 0) {
            debtsContainer.innerHTML = '<p class="no-debts">Нет записей о долгах</p>';
            return;
        }
        
        // Сортируем долги: сначала неоплаченные, затем по дате (новые сверху)
        const sortedDebts = [...debts].sort((a, b) => {
            if (a.settled !== b.settled) {
                return a.settled ? 1 : -1;
            }
            return new Date(b.date) - new Date(a.date);
        });
        
        sortedDebts.forEach(debt => {
            const debtElement = document.createElement('div');
            debtElement.className = `debt-item ${debt.settled ? 'settled' : ''}`;
            
            const date = new Date(debt.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            debtElement.innerHTML = `
                <div class="debt-info">
                    <strong>${debt.person1}</strong> → <strong>${debt.person2}</strong>
                    <div class="debt-description">${debt.description || 'Без описания'}</div>
                    <div class="debt-date">${formattedDate}</div>
                </div>
                <div class="debt-amount ${debt.settled ? 'debt-settled' : ''}">
                    ${debt.amount.toFixed(2)} ₽
                </div>
                <div class="debt-actions">
                    <button class="settle-btn" data-id="${debt.id}">
                        <i class="fas fa-check"></i> ${debt.settled ? 'Возобновить' : 'Погасить'}
                    </button>
                    <button class="delete-btn" data-id="${debt.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `;
            
            if (debt.settled) {
                debtElement.style.opacity = '0.7';
            }
            
            debtsContainer.appendChild(debtElement);
        });
        
        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteDebt(id);
            });
        });
        
        document.querySelectorAll('.settle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                toggleSettleDebt(id);
            });
        });
    }
    
    // Функция для удаления долга
    function deleteDebt(id) {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            debts = debts.filter(debt => debt.id !== id);
            saveDebts();
            renderDebts();
            updateStats();
        }
    }
    
    // Функция для отметки долга как погашенного/непогашенного
    function toggleSettleDebt(id) {
        debts = debts.map(debt => {
            if (debt.id === id) {
                return { ...debt, settled: !debt.settled };
            }
            return debt;
        });
        saveDebts();
        renderDebts();
        updateStats();
    }
    
    // Функция для обновления статистики
    function updateStats() {
        const people = new Set();
        const balances = {};
        let totalDebt = 0;
        let activeDebts = 0;
        let settledDebts = 0;
        
        debts.forEach(debt => {
            people.add(debt.person1);
            people.add(debt.person2);
            
            if (!debt.settled) {
                balances[debt.person1] = (balances[debt.person1] || 0) + debt.amount;
                balances[debt.person2] = (balances[debt.person2] || 0) - debt.amount;
                totalDebt += debt.amount;
                activeDebts++;
            } else {
                settledDebts++;
            }
        });
        
        // Создаем HTML для статистики
        let statsHTML = `
            <div class="stat-card">
                <h3>Общая сумма долгов</h3>
                <p>${totalDebt.toFixed(2)} ₽</p>
            </div>
            <div class="stat-card">
                <h3>Активные долги</h3>
                <p>${activeDebts}</p>
            </div>
            <div class="stat-card">
                <h3>Погашенные долги</h3>
                <p>${settledDebts}</p>
            </div>
        `;
        
        // Добавляем баланс для каждого человека
        const peopleArray = Array.from(people);
        peopleArray.forEach(person => {
            const balance = balances[person] || 0;
            statsHTML += `
                <div class="stat-card">
                    <h3>Баланс ${person}</h3>
                    <p class="${balance > 0 ? 'debt-positive' : balance < 0 ? 'debt-negative' : ''}">
                        ${balance.toFixed(2)} ₽
                    </p>
                </div>
            `;
        });
        
        totalStats.innerHTML = statsHTML;
    }
    
    // Обработка нажатия Enter в полях ввода
    [person1Input, person2Input, amountInput, descriptionInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addDebtBtn.click();
            }
        });
    });
});
