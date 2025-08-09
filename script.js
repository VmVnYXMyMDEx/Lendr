document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных
    if (!localStorage.getItem('friends')) {
        localStorage.setItem('friends', JSON.stringify([
            { id: 1, name: 'Алексей' },
            { id: 2, name: 'Мария' },
            { id: 3, name: 'Иван' }
        ]));
    }

    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([
            { 
                id: 1, 
                from: 1, 
                to: 2, 
                amount: 5000, 
                description: 'На ремонт машины', 
                date: '2023-05-15',
                terms: 'no-interest'
            },
            { 
                id: 2, 
                from: 3, 
                to: 1, 
                amount: 3000, 
                description: 'На подарок', 
                date: '2023-06-20',
                terms: '5-percent'
            }
        ]));
    }

    // DOM элементы
    const tabButtons = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const transactionForm = document.getElementById('transaction-form');
    const friendsList = document.getElementById('friends-list');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const transactionsTable = document.getElementById('transactions-table').querySelector('tbody');
    const balancesList = document.getElementById('balances-list');
    const totalDebtSpan = document.getElementById('total-debt');
    const activeLoansSpan = document.getElementById('active-loans');

    // Переключение вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Убираем активный класс у всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке и контенту
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Загрузка друзей в селекты и список
    function loadFriends() {
        const friends = JSON.parse(localStorage.getItem('friends'));
        
        // Очищаем селекты
        fromSelect.innerHTML = '<option value="">Выберите друга</option>';
        toSelect.innerHTML = '<option value="">Выберите друга</option>';
        
        // Очищаем список друзей
        friendsList.innerHTML = '';
        
        // Заполняем селекты и список
        friends.forEach(friend => {
            const option1 = document.createElement('option');
            option1.value = friend.id;
            option1.textContent = friend.name;
            fromSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = friend.id;
            option2.textContent = friend.name;
            toSelect.appendChild(option2);
            
            const li = document.createElement('li');
            li.innerHTML = `
                ${friend.name}
                <button class="delete-friend" data-id="${friend.id}">Удалить</button>
            `;
            friendsList.appendChild(li);
        });
        
        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.delete-friend').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteFriend(id);
            });
        });
    }

    // Добавление нового друга
    addFriendBtn.addEventListener('click', function() {
        const name = prompt('Введите имя друга:');
        if (name && name.trim() !== '') {
            const friends = JSON.parse(localStorage.getItem('friends'));
            const newId = friends.length > 0 ? Math.max(...friends.map(f => f.id)) + 1 : 1;
            
            friends.push({
                id: newId,
                name: name.trim()
            });
            
            localStorage.setItem('friends', JSON.stringify(friends));
            loadFriends();
        }
    });

    // Удаление друга
    function deleteFriend(id) {
        if (confirm('Вы уверены, что хотите удалить этого друга?')) {
            let friends = JSON.parse(localStorage.getItem('friends'));
            friends = friends.filter(friend => friend.id !== id);
            localStorage.setItem('friends', JSON.stringify(friends));
            loadFriends();
        }
    }

    // Загрузка транзакций
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const friends = JSON.parse(localStorage.getItem('friends'));
        
        transactionsTable.innerHTML = '';
        
        transactions.forEach(transaction => {
            const fromFriend = friends.find(f => f.id === transaction.from);
            const toFriend = friends.find(f => f.id === transaction.to);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${fromFriend ? fromFriend.name : 'Неизвестно'}</td>
                <td>${toFriend ? toFriend.name : 'Неизвестно'}</td>
                <td>${transaction.amount} ₽</td>
                <td>${transaction.description}</td>
            `;
            transactionsTable.appendChild(row);
        });
    }

    // Расчет балансов
    function calculateBalances() {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const friends = JSON.parse(localStorage.getItem('friends'));
        
        const balances = {};
        
        // Инициализация балансов для всех друзей
        friends.forEach(friend => {
            balances[friend.id] = 0;
        });
        
        // Расчет балансов
        transactions.forEach(transaction => {
            balances[transaction.from] -= transaction.amount;
            balances[transaction.to] += transaction.amount;
        });
        
        // Отображение балансов
        balancesList.innerHTML = '';
        let totalDebt = 0;
        let activeLoans = 0;
        
        friends.forEach(friend => {
            const balance = balances[friend.id];
            
            if (balance !== 0) {
                activeLoans++;
                totalDebt += Math.abs(balance);
                
                const card = document.createElement('div');
                card.className = `balance-card ${balance > 0 ? 'positive' : 'negative'}`;
                card.innerHTML = `
                    <h3>${friend.name}</h3>
                    <div class="balance-amount">${balance > 0 ? '+' : ''}${balance} ₽</div>
                    <p>${balance > 0 ? 'Должен вам' : 'Вы должны'}</p>
                `;
                balancesList.appendChild(card);
            }
        });
        
        // Общая статистика
        totalDebtSpan.textContent = totalDebt;
        activeLoansSpan.textContent = activeLoans;
    }

    // Добавление новой транзакции
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const from = parseInt(fromSelect.value);
        const to = parseInt(toSelect.value);
        const amount = parseFloat(amount.value);
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        const terms = document.getElementById('terms').value;
        
        if (from === to) {
            alert('Нельзя выбрать одного и того же друга в обоих полях!');
            return;
        }
        
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        
        transactions.push({
            id: newId,
            from,
            to,
            amount,
            description,
            date,
            terms
        });
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Очищаем форму
        transactionForm.reset();
        
        // Обновляем данные
        loadTransactions();
        calculateBalances();
        
        // Показываем уведомление
        alert('Транзакция успешно добавлена!');
    });

    // Установка текущей даты по умолчанию
    document.getElementById('date').valueAsDate = new Date();

    // Первоначальная загрузка данных
    loadFriends();
    loadTransactions();
    calculateBalances();
});
