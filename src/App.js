
import React, { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const App = () => {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const fetchMeals = async () => {
      const res = await fetch(`https://structured-backend.onrender.com/api/meals/${today}`);
      const data = await res.json();
      setMeals(data);
    };

    const setupPush = async () => {
      const swReg = await navigator.serviceWorker.register("/sw.js");
      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array("BFbkQFoy4Zuc7yT5SUP2x5QOfE1mfrjgykdJQ3qsaA4LHWUPl9RXzxMG9Ps83urBlRSl9234mzgbpy_THWjpsHQ")
      });

      await fetch("https://structured-backend.onrender.com/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });
    };

    Notification.requestPermission().then((perm) => {
      if (perm === "granted") setupPush();
    });

    fetchMeals();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Meal Reminder App</h2>
      <p>Notifications will be sent 10 minutes before each meal.</p>

      <h3>Today's Meals</h3>
      <ul>
        {meals.map((m, i) => (
          <li key={i}>
            <strong>{m.time}</strong>: {m.name} - {m.instructions}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;