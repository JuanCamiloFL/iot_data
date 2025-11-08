import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB-37BHe4RU2ud_TVhPbTtupGEE_oHsWCw",
  authDomain: "iotclasecamilo.firebaseapp.com",
  databaseURL: "https://iotclasecamilo-default-rtdb.firebaseio.com",
  projectId: "iotclasecamilo",
  storageBucket: "iotclasecamilo.firebasestorage.app",
  messagingSenderId: "891176495977",
  appId: "1:891176495977:web:973c88c54f7fb96fab6bf8",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referencias
const tempRef = ref(db, "Temperatura");
const humRef = ref(db, "Humedad");
const lightRef = ref(db, "Luz");
const ledRef = ref(db, "LedValue");

// Variables globales
let ledState = "0";

// DOM elements
const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const lightEl = document.getElementById("light");
const ledBtn = document.getElementById("led-btn");

// Control LED
onValue(ledRef, (snapshot) => {
  // Forzar a string para evitar discrepancias entre '1' (string) y 1 (number)
  const val = snapshot.val();
  ledState = String(val ?? "0");
  ledBtn.textContent = ledState === "1" ? "Apagar LED" : "Encender LED";
  console.log("Datos recibidos (LedValue):", ledState);
}, (error) => {
  console.error("Error al leer LedValue:", error);
});

// Toggle LED con manejo de promesas y logging
const toggleLed = async () => {
  const newState = ledState === "1" ? "0" : "1";
  // Mostrar intención en consola
  console.log(`Intentando cambiar LedValue a: ${newState}`);
  try {
    await set(ledRef, newState);
    console.log(`LedValue establecido a ${newState} correctamente`);
    // Actualizamos estado local inmediatamente (opcional, la DB también disparará onValue)
    ledState = newState;
    ledBtn.textContent = ledState === "1" ? "Apagar LED" : "Encender LED";
  } catch (err) {
    console.error("Error al escribir LedValue:", err);
    // Aquí puedes mostrar un aviso en la UI si quieres
  }
};

ledBtn.addEventListener("click", toggleLed);

// Configuración de gráficos
const maxPoints = 20;
const timeLabels = [];

const tempData = [];
const humData = [];
const lightData = [];

const createChart = (ctx, label, color, data) => new Chart(ctx, {
  type: "line",
  data: {
    labels: timeLabels,
    datasets: [{
      label,
      data,
      borderColor: color,
      borderWidth: 2,
      tension: 0.2,
      pointRadius: 0
    }]
  },
  options: {
    animation: false,
    scales: {
      y: { beginAtZero: true },
      x: { display: false }
    },
    plugins: { legend: { labels: { color: "#fff" } } }
  }
});

// Inicializa gráficos
const tempChart = createChart(document.getElementById("tempChart"), "Temperatura (°C)", "#ff6384", tempData);
const humChart = createChart(document.getElementById("humChart"), "Humedad (%)", "#36a2eb", humData);
const lightChart = createChart(document.getElementById("lightChart"), "Luz", "#ffcd56", lightData);

// Actualiza datos y gráficas
const updateChart = (chart, value, dataArray) => {
  const now = new Date().toLocaleTimeString().split(" ")[0];
  if (timeLabels.length >= maxPoints) {
    timeLabels.shift();
    dataArray.shift();
  }
  timeLabels.push(now);
  dataArray.push(value);
  chart.update();
};

// Lectura en tiempo real
onValue(tempRef, (snapshot) => {
  const val = snapshot.val();
  tempEl.innerText = val;
  updateChart(tempChart, val, tempData);
});

onValue(humRef, (snapshot) => {
  const val = snapshot.val();
  humEl.innerText = val;
  updateChart(humChart, val, humData);
});

onValue(lightRef, (snapshot) => {
  const val = snapshot.val();
  lightEl.innerText = val;
  updateChart(lightChart, val, lightData);
});
