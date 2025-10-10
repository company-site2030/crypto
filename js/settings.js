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
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("fullName").value = data.fullName || "";
    document.getElementById("phone").value = data.phone || "";
  }
}

document.getElementById("saveBtn").addEventListener("click", async () => {
  const newName = document.getElementById("fullName").value.trim();
  const newPhone = document.getElementById("phone").value.trim();

  if (!newName || !newPhone) {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  const userRef = doc(db, "users", currentUserId);
  await updateDoc(userRef, {
    fullName: newName,
    phone: newPhone
  });

  alert("✅ تم تحديث البيانات بنجاح");
  window.location.href = "dashboard.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
