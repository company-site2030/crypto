import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

let currentUserId = null;

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUserId = user.uid;
    loadUserData();
  }
});

async function loadUserData() {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    document.getElementById("userName").textContent = `👤 الاسم: ${data.fullName}`;
    document.getElementById("userPhone").textContent = `📞 الهاتف: ${data.phone}`;
    document.getElementById("userEmail").textContent = `📧 ${data.email}`;
    document.getElementById("walletId").textContent = `🪪 رقم المحفظة: ${data.walletId || "—"}`;
    document.getElementById("balance").textContent = `${data.balance || 0} USDT`;
  }
}

// زر نسخ العنوان
document.getElementById("copyAddress").addEventListener("click", () => {
  navigator.clipboard.writeText("0x7F8125C197B845E1F0682A9846B94A11cA9d9743");
  alert("📋 تم نسخ عنوان الإيداع");
});

// تسجيل عملية إيداع
document.getElementById("depositBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if (!amount || amount <= 0) return alert("❌ أدخل مبلغ صحيح");

  await addDoc(collection(db, "transactions"), {
    userId: currentUserId,
    type: "deposit",
    amount: amount,
    status: "pending",
    createdAt: serverTimestamp()
  });

  document.getElementById("depositAmount").value = "";
  alert("✅ تم تسجيل طلب الإيداع بنجاح");
});

// تسجيل عملية سحب
document.getElementById("withdrawBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const address = document.getElementById("withdrawAddress").value.trim();

  if (!amount || amount <= 0 || !address) return alert("❌ أدخل المبلغ والعنوان بشكل صحيح");

  await addDoc(collection(db, "transactions"), {
    userId: currentUserId,
    type: "withdraw",
    amount: amount,
    walletAddress: address,
    status: "pending",
    createdAt: serverTimestamp()
  });

  document.getElementById("withdrawAmount").value = "";
  document.getElementById("withdrawAddress").value = "";
  alert("✅ تم إرسال طلب السحب بنجاح");
});

// تسجيل الخروج
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

/* ---------------------- وظائف منصة التداول ---------------------- */

// دالة للحصول على أسعار العملات (يمكن تطويرها لاحقًا لAPI خارجي)
async function getAssetPrice(asset) {
  const prices = { BTC: 30000, ETH: 2000, USDT: 1 };
  return prices[asset] || 1;
}

// شراء عملة
document.getElementById('buyBtn').addEventListener('click', async () => {
  const asset = document.getElementById('tradeAsset').value;
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  if (isNaN(amount) || amount <= 0) return alert('❌ أدخل كمية صحيحة');

  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  let balance = userSnap.data().balance || 0;

  const price = await getAssetPrice(asset);
  const totalCost = amount * price;

  if (balance < totalCost) return alert('❌ الرصيد غير كافي');

  balance -= totalCost;

  await updateDoc(userRef, {
    balance: balance,
    trades: arrayUnion({
      type: "buy",
      asset: asset,
      amount: amount,
      price: price,
      date: new Date().toLocaleString()
    })
  });

  document.getElementById('tradeAmount').value = "";
  updateBalanceUI(balance);
  alert(`✅ تم شراء ${amount} ${asset} بنجاح`);
});

// بيع عملة
document.getElementById('sellBtn').addEventListener('click', async () => {
  const asset = document.getElementById('tradeAsset').value;
  const amount = parseFloat(document.getElementById('tradeAmount').value);
  if (isNaN(amount) || amount <= 0) return alert('❌ أدخل كمية صحيحة');

  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  let balance = userSnap.data().balance || 0;
  let trades = userSnap.data().trades || [];

  const owned = trades.filter(t => t.asset === asset && t.type === "buy").reduce((sum, t) => sum + t.amount, 0);
  const sold = trades.filter(t => t.asset === asset && t.type === "sell").reduce((sum, t) => sum + t.amount, 0);
  const available = owned - sold;

  if (available < amount) return alert('❌ الكمية غير متوفرة للبيع');

  const price = await getAssetPrice(asset);
  const totalGain = amount * price;
  balance += totalGain;

  await updateDoc(userRef, {
    balance: balance,
    trades: arrayUnion({
      type: "sell",
      asset: asset,
      amount: amount,
      price: price,
      date: new Date().toLocaleString()
    })
  });

  document.getElementById('tradeAmount').value = "";
  updateBalanceUI(balance);
  alert(`✅ تم بيع ${amount} ${asset} بنجاح`);
});

// كشف الحساب لجميع العمليات
document.getElementById('accountHistoryBtn').addEventListener('click', async () => {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  const trades = userSnap.data().trades || [];

  const tbody = document.getElementById('tradeHistoryBody');
  tbody.innerHTML = '';
  trades.forEach(trade => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-2 border">${trade.date}</td>
      <td class="p-2 border">${trade.type}</td>
      <td class="p-2 border">${trade.asset}</td>
      <td class="p-2 border">${trade.amount}</td>
      <td class="p-2 border">${trade.price}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('tradeHistory').classList.remove('hidden');
});

// تحديث الرصيد في الواجهة
function updateBalanceUI(balance) {
  document.getElementById('balance').textContent = balance.toFixed(2) + ' USDT';
}
