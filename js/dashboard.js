import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcFemOaKgEJWruUmBukhxI_S7YJMvV9Rc",
  authDomain: "crybto-c1fa2.firebaseapp.com",
  projectId: "crybto-c1fa2",
  storageBucket: "crybto-c1fa2.firebasestorage.app",
  messagingSenderId: "1036378779021",
  appId: "1:1036378779021:web:3fbe6f549d62db2d3a21c4",
  measurementId: "G-NHXY10VRYH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// مراقبة حالة المستخدم
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      document.getElementById("userName").innerText = userSnap.data().fullName || "مستخدم";
    }
  }
});

// زر تسجيل الخروج
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// جلب بيانات العملات من CoinGecko API
async function loadCryptoData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano&sparkline=false"
    );
    const data = await res.json();
    const table = document.getElementById("cryptoTable");
    table.innerHTML = "";

    data.forEach((coin) => {
      const changeColor = coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600";
      const row = `
        <tr class="hover:bg-gray-50 transition">
          <td class="border p-2 font-semibold">${coin.name} (${coin.symbol.toUpperCase()})</td>
          <td class="border p-2">$${coin.current_price.toLocaleString()}</td>
          <td class="border p-2 ${changeColor}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
          <td class="border p-2">$${coin.market_cap.toLocaleString()}</td>
        </tr>
      `;
      table.innerHTML += row;
    });
  } catch (err) {
    console.error("حدث خطأ في جلب البيانات:", err);
  }
}

// رسم بياني لسعر البيتكوين خلال 7 أيام
async function drawBTCChart() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
    );
    const data = await res.json();
    const prices = data.prices.map((p) => p[1]);
    const labels = data.prices.map((_, i) => `اليوم ${i + 1}`);

    const ctx = document.getElementById("btcChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "سعر BTC (دولار)",
            data: prices,
            borderWidth: 2,
            borderColor: "#2563eb",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  } catch (err) {
    console.error("حدث خطأ في تحميل الرسم البياني:", err);
  }
}

loadCryptoData();
drawBTCChart();
