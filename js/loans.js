// Данные о займах (можно заменить на fetch к JSON / бэкенду)
const loans = [
    {
        id: 1,
        lender: "Алексей",
        borrower: "Иван",
        amount: 5000,
        interest: 5,
        dueDate: "2023-12-31",
        status: "Активный"
    },
    {
        id: 2,
        lender: "Мария",
        borrower: "Дмитрий",
        amount: 3000,
        interest: 0,
        dueDate: "2023-11-15",
        status: "Просрочен"
    }
];

function renderLoans() {
    const loanList = document.getElementById("loanList");
    loanList.innerHTML = loans.map(loan => `
        <div class="loan-card">
            <h3>Займ #${loan.id}</h3>
            <p><strong>Кредитор:</strong> ${loan.lender}</p>
            <p><strong>Заёмщик:</strong> ${loan.borrower}</p>
            <p><strong>Сумма:</strong> ${loan.amount} ₽</p>
            <p><strong>Процент:</strong> ${loan.interest}%</p>
            <p><strong>Срок:</strong> ${loan.dueDate}</p>
            <p class="status-${loan.status.toLowerCase()}">${loan.status}</p>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderLoans);
