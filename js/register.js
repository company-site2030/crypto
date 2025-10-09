import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

document.getElementById("registerBtn").addEventListener("click", async () => {
  const fullName = document.getElementById("fullName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !phoneNumber || !email || !password) {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // حفظ بيانات المستخدم في Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      phoneNumber,
      email,
      createdAt: new Date().toISOString()
    });

    alert("تم إنشاء الحساب بنجاح 🎉");
    // تفريغ الحقول بعد التسجيل
    document.getElementById("fullName").value = "";
    document.getElementById("phoneNumber").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    // تحويل المستخدم إلى صفحة الدخول
    window.location.href = "login.html";
  } catch (error) {
    alert("حدث خطأ: " + error.message);
  }
});
