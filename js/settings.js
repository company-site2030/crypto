import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      document.getElementById("fullName").value = userSnap.data().fullName || "";
      document.getElementById("phoneNumber").value = userSnap.data().phoneNumber || "";
    }
  }
});

// زر حفظ التعديلات
document.getElementById("saveBtn").addEventListener("click", async () => {
  const fullName = document.getElementById("fullName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();

  if (!fullName || !phoneNumber) {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  try {
    await updateDoc(doc(db, "users", currentUserId), {
      fullName,
      phoneNumber
    });

    alert("تم حفظ التغييرات بنجاح ✅");
  } catch (error) {
    alert("حدث خطأ أثناء التحديث: " + error.message);
  }
});

// زر العودة إلى الداشبورد
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// زر تسجيل الخروج
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
