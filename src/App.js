import React, { useEffect, useState } from "react";

const App = () => {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    // Request permission for notifications
    Notification.requestPermission();

    // Get today's meals from backend
    const fetchMeals = async () => {
      const today = new Date().toLocaleString("en-US", { weekday: "long" });
      try {
        const response = await fetch(`http://localhost:8000/api/meals/${today}`);
        const data = await response.json();
        setMeals(data);
      } catch (error) {
        console.error("Failed to fetch meals", error);
      }
    };

    fetchMeals();

    // Check every minute if it's time to notify
    const checkTime = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      meals.forEach((meal) => {
        const [hh, mm] = meal.time.split(":");
        const mealTime = new Date(now);
        mealTime.setHours(hh, mm - 10, 0); // 10 minutes before meal time

        const notifyTime = mealTime.toTimeString().slice(0, 5);
        if (currentTime === notifyTime) {
          new Notification(`Upcoming: ${meal.name}`, {
            body: meal.instructions,
          });
        }
      });
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [meals]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Meal Reminder App</h2>
      <p>Notifications will be sent 10 minutes before each meal.</p>

      <h3>Today's Meals</h3>
      <ul>
        {meals.map((meal, index) => (
          <li key={index}>
            <strong>{meal.time}</strong> - {meal.name}: {meal.instructions}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;