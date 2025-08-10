document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const addDebtBtn = document.getElementById('addDebtBtn');
    const settleUpBtn = document.getElementById('settleUpBtn');
    const debtModal = document.getElementById('debtModal');
    const closeBtn = document.querySelector('.close');
    const debtForm = document.getElementById('debtForm');
    const debtsTableBody = document.getElementById('debtsTableBody');
    const summaryStats = document.getElementById('summaryStats');
    
    // Данные о долгах
    let debts = JSON.parse(localStorage.getItem('debts')) || [];
    
    // Открытие модального окна для добавления долга
    addDebtBtn.addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = 'Добавить новый долг';
        debtForm.reset();
        debtForm.dataset.mode = 'add';
        debtModal.style.display = 'block';
    });
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        debtModal.style.display = 'none';
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === debtModal) {
            debtModal.style.display = 'none';
        }
    });
    
    // Обработка формы
    debtForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const debtor = document.getElementById('debtor').value;
        const creditor = document.getElementById('creditor').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        
        const debt = {
            id: Date.now(),
            debtor,
            creditor,
            amount,
            description,
            date
        };
        
        if (debtForm.dataset.mode === 'add') {
            debts.push(debt);
        } else if (debtForm.dataset.mode === 'edit') {
            const debtId = parseInt(debtForm.dataset.debtId);
            const index = debts.findIndex(d => d.id === debtId);
            if (index !== -1) {
                debts[index] = {...debt, id: debtId};
            }
        }
        
        saveDebts();
        renderDebts();
        renderSummary();
        
        debtModal.style.display = 'none';
    });
    
    // Сохранение долгов в localStorage
    function saveDebts() {
        localStorage.setItem('debts', JSON.stringify(debts));
    }
    
    // Отображение списка долгов
    function renderDebts() {
        debtsTableBody.innerHTML = '';
        
        if (debts.length === 0) {
            debtsTableBody.innerHTML = '<tr><td colspan="6">Нет записей о долгах</td></tr>';
            return;
        }
        
        debts.forEach(debt => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${debt.debtor}</td>
                <td>${debt.creditor}</td>
                <td>${debt.amount.toFixed(2)}</td>
                <td>${debt.description || '-'}</td>
                <td>${formatDate(debt.date)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${debt.id}">Изменить</button>
                    <button class="action-btn delete-btn" data-id="${debt.id}">Удалить</button>
                </td>
            `;
            
            debtsTableBody.appendChild(row);
        });
        
        // Обработчики для кнопок редактирования и удаления
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const debtId = parseInt(this.dataset.id);
                editDebt(debtId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const debtId = parseInt(this.dataset.id);
                deleteDebt(debtId);
            });
        });
    }
    
    // Редактирование долга
    function editDebt(debtId) {
        const debt = debts.find(d => d.id === debtId);
        if (!debt) return;
        
        document.getElementById('modalTitle').textContent = 'Редактировать долг';
        document.getElementById('debtor').value = debt.debtor;
        document.getElementById('creditor').value = debt.creditor;
        document.getElementById('amount').value = debt.amount;
        document.getElementById('description').value = debt.description || '';
        document.getElementById('date').value = debt.date;
        
        debtForm.dataset.mode = 'edit';
        debtForm.dataset.debtId = debtId;
        debtModal.style.display = 'block';
    }
    
    // Удаление долга
    function deleteDebt(debtId) {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            debts = debts.filter(d => d.id !== debtId);
            saveDebts();
            renderDebts();
            renderSummary();
        }
    }
    
    // Отображение сводной статистики
    function renderSummary() {
        if (debts.length === 0) {
            summaryStats.innerHTML = '<p>Нет данных для отображения</p>';
            return;
        }
        
        // Группировка долгов по должникам и кредиторам
        const debtSummary = {};
        
        debts.forEach(debt => {
            const key = `${debt.debtor}_${debt.creditor}`;
            
            if (!debtSummary[key]) {
                debtSummary[key] = {
                    debtor: debt.debtor,
                    creditor: debt.creditor,
                    total: 0
                };
            }
            
            debtSummary[key].total += debt.amount;
        });
        
        // Создание HTML для отображения
        let html = '<ul>';
        
        for (const key in debtSummary) {
            const item = debtSummary[key];
            html += `<li><strong>${item.debtor}</strong> должен <strong>${item.creditor}</strong>: ${item.total.toFixed(2)}</li>`;
        }
        
        html += '</ul>';
        summaryStats.innerHTML = html;
    }
    
    // Форматирование даты
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
    
    // Инициализация приложения
    function init() {
        // Установка сегодняшней даты по умолчанию
        document.getElementById('date').valueAsDate = new Date();
        
        renderDebts();
        renderSummary();
    }
    
    init();
    // Обработчики для кнопок экспорта/импорта
document.getElementById('exportBtn')?.addEventListener('click', exportData);
document.getElementById('importBtn')?.addEventListener('click', importData);

function exportData() {
    const dataStr = JSON.stringify(debts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'debts-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const importedDebts = JSON.parse(event.target.result);
                if (Array.isArray(importedDebts)) {
                    debts = importedDebts;
                    saveDebts();
                    renderDebts();
                    renderSummary();
                    alert('Данные успешно импортированы!');
                } else {
                    alert('Ошибка: неверный формат данных');
                }
            } catch (error) {
                alert('Ошибка при чтении файла: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
});
