document.addEventListener('DOMContentLoaded', () => {
  const procurementForm = document.getElementById('procurement-form');
  const salesForm = document.getElementById('sales-form');
  const reportsForm = document.getElementById('reports-form');

  procurementForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('produce-name').value,
      type: document.getElementById('produce-type').value,
      tonnage: document.getElementById('tonnage').value,
      cost: document.getElementById('cost').value,
      dealerName: document.getElementById('dealer-name').value,
      branch: document.getElementById('branch').value,
      contact: document.getElementById('contact').value,
      salePrice: document.getElementById('sale-price').value
    };

    fetch('/procurement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
  });

  salesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      produceName: document.getElementById('produce-name-sales').value,
      tonnage: document.getElementById('tonnage-sales').value,
      amountPaid: document.getElementById('amount-paid').value,
      buyerName: document.getElementById('buyer-name').value,
      salesAgentName: document.getElementById('sales-agent-name').value
    };

    fetch('/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
  });

  reportsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      reportType: document.getElementById('report-type').value,
      branch: document.getElementById('branch-report').value
    };

    fetch('/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
  });
});
