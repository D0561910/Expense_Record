const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const today = moment().format("D/MMM/YYYY");
const checkbox = $("input[name=type]:checked", "#tracking-form").val();

// const dummyTransactions = [
//   { id: 1, text: 'Flower', amount: -20 },
//   { id: 2, text: 'Salary', amount: 300 },
//   { id: 3, text: 'Book', amount: -10 },
//   { id: 4, text: 'Camera', amount: 150 }
// ];

// const localStorageTransactions = JSON.parse(
//   localStorage.getItem("transactions")
// );

// let transactions =
//   localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// // Add transaction
// function addTransaction(e) {
//   e.preventDefault();

//   if (text.value.trim() === "" || amount.value.trim() === "") {
//     console.log("Hello");
//     alert("Please add a text and amount");
//   } else {
//     const transaction = {
//       id: generateID(),
//       date: today,
//       text: text.value,
//       amount: +amount.value
//     };

//     transactions.push(transaction);

//     addTransactionDOM(transaction);

//     updateValues();

//     updateLocalStorage();

//     text.value = "";
//     amount.value = "";
//   }
// }

// // Generate random ID
// function generateID() {
//   return Math.floor(Math.random() * 100000000);
// }

// // Add transactions to DOM list
// function addTransactionDOM(transaction) {
//   // Get sign
//   const sign = transaction.amount < 0 ? "-" : "+";

//   const item = document.createElement("li");

//   // Add class based on value
//   item.classList.add(transaction.amount < 0 ? "minus" : "plus");

//   item.innerHTML = `<span>${transaction.date}</span>
//     ${transaction.text} <span>${sign}${Math.abs(
//     transaction.amount
//   )}</span> <button class="delete-btn" onclick="removeTransaction(${
//     transaction.id
//   })">x</button>
//   `;

//   list.appendChild(item);
// }

// // Update the balance, income and expense
// function updateValues() {
//   const amounts = transactions.map(transaction => transaction.amount);

//   const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

//   const income = amounts
//     .filter(item => item > 0)
//     .reduce((acc, item) => (acc += item), 0)
//     .toFixed(2);

//   const expense = (
//     amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
//     -1
//   ).toFixed(2);

//   balance.innerText = `NTD $${total}`;
//   money_plus.innerText = `NTD $${income}`;
//   money_minus.innerText = `NTD $${expense}`;
// }

// // Remove transaction by ID
// function removeTransaction(id) {
//   transactions = transactions.filter(transaction => transaction.id !== id);

//   updateLocalStorage();

//   init();
// }

// // Update local storage transactions
// function updateLocalStorage() {
//   localStorage.setItem("transactions", JSON.stringify(transactions));
// }

// // Init app
// function init() {
//   list.innerHTML = "";

//   transactions.forEach(addTransactionDOM);
//   updateValues();
// }

// init();

// form.addEventListener("submit", addTransaction);

function deleteRecoed(element) {
  $.ajax({
    type: "DELETE",
    url: "/api/delete",
    data: {
      key: element.id.trim()
    },
    success: function() {
      location.reload();
    }
  });
}

function openTab(e, tabId){
   var i, tabcontent, tablink;
   
   tabcontent = document.getElementsByClassName('tab-content');
   for(i=0; i<tabcontent.length; i++){
     tabcontent[i].style.display = "none";
   }

   document.getElementById(tabId).style.display = "block";
   e.currentTarget.className += 'active'; 
}

$(document).ready(function() {
  $("#btn-save").click(function() {
    $.ajax({
      type: "POST",
      url: "/api/add",
      data: {
        date: moment().format("D/MMM/YYYY"),
        text: $("#text").val(),
        amount: $("#amount").val(),
        typeSelect: $("input[name=type]:checked", "#tracking-form").val(),
        createBy: $("input[name=user]:checked", "#tracking-form").val()
      },
      success: function(data) {
        if (data.message === "Resource created") {
          alert(data.message);
          location.reload();
        } else {
          alert(data.message);
        }
      }
    });
  });

  $("#btn-login").click(function() {

    $.ajax({
      url: "/login",
      type: "POST",
      data: {
        username: $("#username")
          .val()
          .trim(),
        password: $("#password")
          .val()
          .trim()
      },
      success: function(data) {
        alert(data.ret_msg);
        location.reload();
      }
    });
  });
});
