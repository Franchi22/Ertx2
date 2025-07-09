const firebaseUrl = "https://ertx-7199e-default-rtdb.firebaseio.com/ertx.json";

const map = L.map('map').setView([18.4861, -69.9312], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([18.4861, -69.9312]).addTo(map);
let mostrarRuta = true;
let puntosRuta = [];
let lineaRuta = null;

// Toggle del botón
document.getElementById("toggleRuta").addEventListener("click", () => {
  mostrarRuta = !mostrarRuta;
  document.getElementById("toggleRuta").innerText = mostrarRuta ? "✅ Mostrar ruta" : "🔄 Solo posición";

  if (!mostrarRuta && lineaRuta) {
    map.removeLayer(lineaRuta);
    lineaRuta = null;
    puntosRuta = [];
  }
});

async function actualizar() {
  try {
    const res = await fetch(firebaseUrl);
    const data = await res.json();
    if (data && data.lat && data.lng) {
      const { lat, lng, vel_gps, vel_mpu, accX, accY, accZ, gyroX, gyroY, gyroZ } = data;

      const nuevaPos = [lat, lng];
      marker.setLatLng(nuevaPos);
      map.setView(nuevaPos, 15);

      const popupContent = `
        <b>📍 Posición:</b><br>
        Lat: ${lat.toFixed(6)}<br>
        Lng: ${lng.toFixed(6)}<br><br>
        <b>🚗 Vel:</b> GPS: ${vel_gps} km/h | MPU: ${vel_mpu?.toFixed(2)} m/s<br><br>
        <b>🧠 Acc [g]:</b> X=${accX}, Y=${accY}, Z=${accZ}<br>
        <b>🔄 Gyro [°/s]:</b> X=${gyroX}, Y=${gyroY}, Z=${gyroZ}
      `;
      marker.bindPopup(popupContent).openPopup();

      if (mostrarRuta) {
        puntosRuta.push(nuevaPos);
        if (puntosRuta.length > 20) puntosRuta.shift();

        if (lineaRuta) {
          lineaRuta.setLatLngs(puntosRuta);
        } else {
          lineaRuta = L.polyline(puntosRuta, { color: 'blue' }).addTo(map);
        }
      }

      // ✅ Verificar alerta del pulsador después de actualizar
      verificarAlerta();
    }
  } catch (err) {
    console.error("Error al actualizar:", err);
  }
}

// 🔁 Auto-actualización cada 1 segundo
setInterval(actualizar, 1000);

// ✅ FUNCIONES DE ALERTA DESDE PULSADOR
function verificarAlerta() {
  fetch("http://" + location.hostname + "/alerta")
    .then(res => res.json())
    .then(data => {
      const estado = data.alerta;
      const alertaSpan = document.getElementById("estadoAlerta");
      if (!alertaSpan) return;

      if (estado === "SI") {
        alertaSpan.textContent = "🚨 ALERTA: Botón presionado";
        alertaSpan.style.color = "red";
      } else {
        alertaSpan.textContent = "✅ Alerta limpia";
        alertaSpan.style.color = "green";
      }
    })
    .catch(() => {
      const alertaSpan = document.getElementById("estadoAlerta");
      if (alertaSpan) {
        alertaSpan.textContent = "❌ Error al consultar alerta";
        alertaSpan.style.color = "gray";
      }
    });
}

function resetearAlerta() {
  fetch("http://" + location.hostname + "/reset_alerta")
    .then(() => verificarAlerta());
}
