import style from "./main.module.css";

import { motion, AnimatePresence, usePresence } from 'framer-motion'
import { useMemo, useEffect, useState } from "react";

import { Warning, Info, Error, CheckCircle } from "@mui/icons-material";
import { useOnMountUnsafe } from "helpers/remountUnsafe.jsx";

// make a component that will show popup notifications of different types (info, warning, error, success)
function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    setNotifications((prev) => [...prev, { type, message }]);

    // remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => {
        const newNotifications = prev.filter((_, index) => index !== 0);
        return newNotifications;
      });
    }, 5000);
  }

  // TEST: push notifications to the array
  useOnMountUnsafe(() => {
    setInterval(() => {
      const types = ['info', 'warning', 'error', 'success'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const message = `This is a ${randomType} notification.`;
      addNotification(randomType, message);
    }, 3000);
    // const types = ['info', 'warning', 'error', 'success'];
    // const randomType = types[Math.floor(Math.random() * types.length)];
    // const message = `This is a ${randomType} notification.`;
    // addNotification(randomType, message);
  }, []);

  return (
    <div className={style.notificationsContainer}>
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <Notification
            key={index}
            notification={notification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Notification({ notification }) {
  return (
    <motion.div
      className={`${style.notification} ${style[notification.type]}`}
      initial={{ x: 400, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 1 }}
    >
      {notification.type === "info" && <Info className={style.icon} />}
      {notification.type === "warning" && <Warning className={style.icon} />}
      {notification.type === "error" && <Error className={style.icon} />}
      {notification.type === "success" && <CheckCircle className={style.icon} />}
      {notification.message}
    </motion.div>
  );
}

export default Notifications;