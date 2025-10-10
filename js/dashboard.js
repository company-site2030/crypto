import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
