import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

// التحقق من المستخدم المسجل
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUserId = user.uid;
    await loadBalance();
    listenToTransactions();
  }
});

// تحميل الرصيد الحالي
async function loadBalance() {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  let balance = 0;
  if (userSnap.exists()) {
    balance = userSnap.data().balance || 0;
  } else {
    await setDoc(userRef, { balance: 0 });
  }
  document.getElementById("balance").textContent = `${balance} USDT`;
}

// إرسال طلب إيداع
document.getElementById("depositBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("depositAmount").value);
  if (!amount || amount <= 0) {
    alert("يرجى إدخال مبلغ صالح للإيداع");
    return;
  }

  await addDoc(collection(db, "transactions"), {
    userId: currentUserId,
    type: "deposit",
    amount,
    status: "pending",
    createdAt: serverTimestamp()
  });

  document.getElementById("depositAmount").value = "";
  alert("تم إرسال طلب الإيداع بنجاح ✅ بانتظار الموافقة");
});

// إرسال طلب سحب
document.getElementById("withdrawBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  if (!amount || amount <= 0) {
    alert("يرجى إدخال مبلغ صالح للسحب");
    return;
  }

  await addDoc(collection(db, "transactions"), {
    userId: currentUserId,
    type: "withdraw",
    amount,
    status: "pending",
    createdAt: serverTimestamp()
  });

  document.getElementById("withdrawAmount").value = "";
  alert("تم إرسال طلب السحب بنجاح ✅ بانتظار الموافقة");
});

// عرض سجل العمليات
function listenToTransactions() {
  const transactionsRef = collection(db, "transactions");
  onSnapshot(transactionsRef, (snapshot) => {
    const list = document.getElementById("transactionsList");
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userId === currentUserId) {
        const color = data.type === "deposit" ? "text-green-600" : "text-red-600";
        const statusColor =
          data.status === "approved"
            ? "text-green-700"
            : data.status === "rejected"
            ? "text-red-700"
            : "text-yellow-600";

        const item = `
          <div class="border p-2 rounded flex justify-between items-center">
            <span class="${color}">${data.type === "deposit" ? "إيداع" : "سحب"}: ${data.amount} USDT</span>
            <span class="${statusColor} text-sm">${data.status}</span>
          </div>
        `;
        list.innerHTML += item;
      }
    });
  });
}

// تسجيل الخروج
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
