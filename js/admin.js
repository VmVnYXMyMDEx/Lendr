document.getElementById("addLoanForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const newLoan = {
        id: Date.now(), // Простой ID
        lender: document.getElementById("lender").value,
        borrower: document.getElementById("borrower").value,
        amount: parseFloat(document.getElementById("amount").value),
        interest: parseFloat(document.getElementById("interest").value),
        dueDate: document.getElementById("dueDate").value,
        status: "Активный"
    };

    // Добавляем в массив (позже можно сохранять в LocalStorage / JSON)
    loans.push(newLoan);
    alert("Займ добавлен!");
    this.reset();
});
