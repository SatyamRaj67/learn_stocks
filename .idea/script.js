document.addEventListener("DOMContentLoaded", function () {
  // Load data from JSON
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      // Populate stock tables
      populateStockTables(data);
      // Set up chart demos
      setupCharts();
    })
    .catch((error) => console.error("Error loading data:", error));

  // Set up navigation
  setupNavigation();

  // Set up modal functionality
  setupModals();
});

// Navigation functionality
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Hide all pages
      document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
      });

      // Remove active class from all nav items
      navItems.forEach((navItem) => {
        navItem.classList.remove("active");
      });

      // Show the selected page
      const pageId = this.getAttribute("data-page");
      document.getElementById(pageId).classList.add("active");

      // Add active class to clicked nav item
      this.classList.add("active");
    });
  });
}

// Modal functionality
function setupModals() {
  // Stock detail modal
  const stockModal = document.getElementById("stockModal");
  const adminStockModal = document.getElementById("adminStockModal");
  const closeButtons = document.querySelectorAll(".close-modal");

  // Close modal when clicking close button
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      stockModal.style.display = "none";
      adminStockModal.style.display = "none";
    });
  });

  // Close modal when clicking outside of modal content
  window.addEventListener("click", function (event) {
    if (event.target === stockModal) {
      stockModal.style.display = "none";
    }
    if (event.target === adminStockModal) {
      adminStockModal.style.display = "none";
    }
  });

  // Quantity input change updates estimated cost
  const quantityInput = document.getElementById("quantity");
  quantityInput.addEventListener("input", function () {
    const price = parseFloat(
      document.getElementById("modalStockPrice").textContent.replace("$", "")
    );
    const quantity = parseInt(this.value) || 0;
    document.getElementById("estimatedCost").textContent =
      "$" + (price * quantity).toFixed(2);
  });

  // Add event listeners to stock table rows to open modal
  document.addEventListener("click", function (e) {
    if (e.target.closest("tr[data-symbol]")) {
      const row = e.target.closest("tr[data-symbol]");
      const symbol = row.getAttribute("data-symbol");
      openStockModal(symbol);
    }

    if (e.target.closest(".edit-stock-btn")) {
      const btn = e.target.closest(".edit-stock-btn");
      const symbol = btn.getAttribute("data-symbol");
      openAdminStockModal(symbol);
    }
  });
}

// Open stock detail modal with data
function openStockModal(symbol) {
  // In a real app, you would fetch stock details from the server
  // For demo purposes, we'll just show the modal with placeholder data
  document.getElementById("stockModal").style.display = "block";
}

// Open admin stock edit modal with data
function openAdminStockModal(symbol) {
  // In a real app, you would fetch stock details from the server
  // For demo purposes, we'll just show the modal with placeholder data
  document.getElementById("adminStockModal").style.display = "block";
}

// Populate stock tables with data from JSON
function populateStockTables(data) {
  // Populate market stocks table
  const stocksList = document.getElementById("stocksList");
  if (stocksList) {
    stocksList.innerHTML = data.stocks
      .map(
        (stock) => `
            <tr data-symbol="${stock.symbol}">
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>$${stock.price.toFixed(2)}</td>
                <td class="${stock.change > 0 ? "positive" : "negative"}">
                    ${stock.change > 0 ? "+" : ""}$${Math.abs(
          stock.change
        ).toFixed(2)}
                </td>
                <td class="${
                  stock.changePercent > 0 ? "positive" : "negative"
                }">
                    ${
                      stock.changePercent > 0 ? "+" : ""
                    }${stock.changePercent.toFixed(2)}%
                </td>
                <td>
                    <button class="btn primary btn-sm">Buy</button>
                    <button class="btn tertiary btn-sm">Watch</button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  // Populate portfolio holdings table
  const holdingsList = document.getElementById("holdingsList");
  if (holdingsList) {
    holdingsList.innerHTML = data.holdings
      .map((holding) => {
        const stock = data.stocks.find((s) => s.symbol === holding.symbol);
        const currentValue = stock.price * holding.shares;
        const costBasis = holding.avgCost * holding.shares;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = (gainLoss / costBasis) * 100;

        return `
                <tr data-symbol="${holding.symbol}">
                    <td>${holding.symbol}</td>
                    <td>${stock.name}</td>
                    <td>${holding.shares}</td>
                    <td>$${holding.avgCost.toFixed(2)}</td>
                    <td>$${stock.price.toFixed(2)}</td>
                    <td>$${currentValue.toFixed(2)}</td>
                    <td class="${gainLoss > 0 ? "positive" : "negative"}">
                        ${gainLoss > 0 ? "+" : ""}$${Math.abs(gainLoss).toFixed(
          2
        )}
                        (${gainLoss > 0 ? "+" : ""}${gainLossPercent.toFixed(
          2
        )}%)
                    </td>
                    <td>
                        <button class="btn primary btn-sm">Buy</button>
                        <button class="btn secondary btn-sm">Sell</button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  // Populate watchlist table
  const watchlistStocks = document.getElementById("watchlistStocks");
  if (watchlistStocks) {
    watchlistStocks.innerHTML = data.watchlist
      .map((item) => {
        const stock = data.stocks.find((s) => s.symbol === item);

        return `
                <tr data-symbol="${stock.symbol}">
                    <td>${stock.symbol}</td>
                    <td>${stock.name}</td>
                    <td>$${stock.price.toFixed(2)}</td>
                    <td class="${stock.change > 0 ? "positive" : "negative"}">
                        ${stock.change > 0 ? "+" : ""}$${Math.abs(
          stock.change
        ).toFixed(2)}
                    </td>
                    <td class="${
                      stock.changePercent > 0 ? "positive" : "negative"
                    }">
                        ${
                          stock.changePercent > 0 ? "+" : ""
                        }${stock.changePercent.toFixed(2)}%
                    </td>
                    <td>$${stock.yearLow.toFixed(
                      2
                    )} - $${stock.yearHigh.toFixed(2)}</td>
                    <td>
                        <button class="btn primary btn-sm">Buy</button>
                        <button class="btn tertiary btn-sm">Remove</button>
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  // Populate transactions table
  const transactionList = document.getElementById("transactionList");
  if (transactionList) {
    transactionList.innerHTML = data.transactions
      .map((transaction) => {
        const stock = data.stocks.find((s) => s.symbol === transaction.symbol);

        return `
                <tr>
                    <td>${transaction.date}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.symbol}</td>
                    <td>${stock ? stock.name : "-"}</td>
                    <td>${transaction.shares || "-"}</td>
                    <td>${
                      transaction.price
                        ? "$" + transaction.price.toFixed(2)
                        : "-"
                    }</td>
                    <td>$${transaction.total.toFixed(2)}</td>
                </tr>
            `;
      })
      .join("");
  }

  // Populate admin stocks table
  const adminStocksList = document.getElementById("adminStocksList");
  if (adminStocksList) {
    adminStocksList.innerHTML = data.stocks
      .map(
        (stock) => `
            <tr data-symbol="${stock.symbol}">
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>$${stock.price.toFixed(2)}</td>
                <td>
                    <input type="number" class="price-edit" value="${stock.price.toFixed(
                      2
                    )}" step="0.01">
                    <button class="btn primary btn-sm update-price-btn">Update</button>
                </td>
                <td>${stock.sector}</td>
                <td>${stock.listedDate}</td>
                <td>
                    <button class="btn secondary btn-sm edit-stock-btn" data-symbol="${
                      stock.symbol
                    }">Edit</button>
                    <button class="btn danger btn-sm delete-stock-btn" data-symbol="${
                      stock.symbol
                    }">Delete</button>
                </td>
            </tr>
        `
      )
      .join("");
  }
}

// Set up chart demos using Chart.js
function setupCharts() {
  // Dashboard portfolio performance chart
  const performanceCtx = document.getElementById("performanceChart");
  if (performanceCtx) {
    new Chart(performanceCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        datasets: [
          {
            label: "Portfolio Value",
            data: [
              19500, 20100, 19800, 21200, 22000, 22500, 23100, 24000, 24856,
            ],
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return "$" + value.toLocaleString();
              },
            },
          },
        },
      },
    });
  }

  // Portfolio allocation chart
  const allocationCtx = document.getElementById("allocationChart");
  if (allocationCtx) {
    new Chart(allocationCtx, {
      type: "doughnut",
      data: {
        labels: ["Technology", "Healthcare", "Finance", "Consumer", "Energy"],
        datasets: [
          {
            data: [45, 20, 15, 12, 8],
            backgroundColor: [
              "#2563eb",
              "#10b981",
              "#f59e0b",
              "#6366f1",
              "#ef4444",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }

  // Stock price chart in modal
  const stockPriceCtx = document.getElementById("stockPriceChart");
  if (stockPriceCtx) {
    new Chart(stockPriceCtx, {
      type: "line",
      data: {
        labels: [
          "9:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
        ],
        datasets: [
          {
            label: "Stock Price",
            data: [
              176.5, 176.9, 177.2, 176.8, 177.4, 177.8, 178.1, 177.9, 178.25,
              178.4, 178.6, 178.3, 178.7, 178.92,
            ],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return "$" + value.toFixed(2);
              },
            },
          },
        },
      },
    });
  }
}
