import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
let userData = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUserId = user.uid;
    await loadUserInfo();
    await loadBalance();
    listenToTransactions();
  }
});

async function loadUserInfo() {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    userData = userSnap.data();
    document.getElementById("uName").textContent = userData.fullName;
    document.getElementById("uPhone").textContent = userData.phone;
    document.getElementById("uEmail").textContent = userData.email;
    document.getElementById("walletId").textContent = userData.walletId;
  }
}

async function loadBalance() {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const balance = userSnap.data().balance || 0;
    document.getElementById("balance").textContent = `${balance} USDT`;
  }
}

document.getElementById("copyAddress").addEventListener("click", () => {
  const address = "0x7F8125C197B845E1F0682A9846B94A11cA9d9743";
  navigator.clipboard.writeText(address);
  alert("تم نسخ العنوان ✅");
});

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
  alert("تم إرسال طلب الإيداع بنجاح ✅");
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const address = document.getElementById("withdrawAddress").value.trim();

  if (!amount || amount <= 0 || !address) {
    alert("يرجى إدخال مبلغ وعنوان المحفظة");
    return;
  }

  await addDoc(collection(db, "transactions"), {
    userId: currentUserId,
    type: "withdraw",
    amount,
    walletAddress: address,
    status: "pending",
    createdAt: serverTimestamp()
  });

  document.getElementById("withdrawAmount").value = "";
  document.getElementById("withdrawAddress").value = "";
  alert("تم إرسال طلب السحب بنجاح ✅");
});

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

        const walletText = data.walletAddress ? `<br><span class="text-xs text-gray-500">${data.walletAddress}</span>` : "";

        const item = `
          <div class="border p-2 rounded flex justify-between items-center">
            <span class="${color}">${data.type}: ${data.amount} USDT${walletText}</span>
            <span class="${statusColor} text-sm">${data.status}</span>
          </div>
        `;
        list.innerHTML += item;
      }
    });
  });
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
