const apiUrl = 'https://mindicador.cl/api/';

const amountEl = document.getElementById('amount');
const fromCurrencyEl = document.getElementById('fromCurrency');
const toCurrencyEl = document.getElementById('toCurrency');
const resultEl = document.getElementById('result');
const convertBtn = document.getElementById('convert');
const historyCanvas = document.getElementById('historyChart');

let historyChartInstance;

// Función para realizar la conversión
async function convertCurrency() {
  const amount = parseFloat(amountEl.value);
  const fromCurrency = fromCurrencyEl.value;
  const toCurrency = toCurrencyEl.value;

  if (isNaN(amount)) {
    alert('Por favor ingresa una cantidad válida');
    return;
  }

  try {
    // Verificar si la moneda seleccionada existe en la API
    const fromResponse = await fetch(`${apiUrl}${fromCurrency}`);
    const toResponse = await fetch(`${apiUrl}${toCurrency}`);

    const fromData = await fromResponse.json();
    const toData = await toResponse.json();

    if (!fromData.serie || !toData.serie) {
      alert('Una o ambas monedas no están disponibles en los datos.');
      return;
    }

    const fromValue = fromData.serie[0].valor;
    const toValue = toData.serie[0].valor;

    // Calculando la tasa de conversión
    const conversionRate = fromValue / toValue;
    const convertedAmount = amount * conversionRate;

    resultEl.textContent = `${amount} ${fromCurrency.toUpperCase()} = ${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}`;

    // Obtener y mostrar el historial de 10 días para la moneda objetivo
    await fetchHistoricalData(toCurrency);
  } catch (error) {
    alert('Error al obtener los datos de la API.');
  }
}

// Obtener y mostrar el historial de los últimos 10 días
async function fetchHistoricalData(currency) {
  try {
    const response = await fetch(`${apiUrl}${currency}`);
    const data = await response.json();

    // Extraer las últimas 10 fechas y valores
    const historicalRates = data.serie.slice(0, 10).reverse(); // Últimos 10 días

    const dates = historicalRates.map(entry => entry.fecha.split('T')[0]); // Formatear fecha
    const values = historicalRates.map(entry => entry.valor);

    updateHistoryChart(dates, values, currency.toUpperCase());
  } catch (error) {
    alert('Error al obtener los datos históricos');
  }
}

// Actualizar gráfico con el historial de los últimos 10 días
function updateHistoryChart(dates, values, currency) {
  if (historyChartInstance) {
    historyChartInstance.destroy();
  }

  historyChartInstance = new Chart(historyCanvas, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `Últimos 10 días (${currency})`,
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// Evento para el botón
convertBtn.addEventListener('click', convertCurrency);
