import classes from "./main.module.css";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "react-i18next";

import { Badge } from "@mui/material";
import { Person } from "@mui/icons-material";

function Users({ customRef, id, users }) {
  const { t } = useTranslation();
  const [dragDirection, setDragDirection] = useState({ x: 0, y: 0, angle: 0 });
  const [userAngles, setUserAngles] = useState([]);

  useEffect(() => {
    const userAngles = [];
    for (let i = 0; i < users.length; i++) userAngles.push("0");
    setUserAngles(userAngles);
  }, [users]);

  const calculateIconRotation = (e, i) => {
    const newX = e.clientX;
    const newY = e.clientY;
    setDragDirection((prev) => {
      if (newX !== prev.x || newY !== prev.y) {
        const angle = Math.atan2(newY - prev.y, newX - prev.x);
        const angleInDegrees = (angle * (180 / Math.PI) + 360) % 360;
        if (Math.abs(angleInDegrees - prev.angle) > 32) {
          setUserAngles((prev) => {
            const newArray = [...prev];
            if (!newArray[i]) newArray[i] = 0;
            if (String(newArray[i]) !== angleInDegrees) {
              newArray[i] = String(angleInDegrees);
              return newArray;
            }
          });
          if (angleInDegrees !== prev.angle)
            return { x: newX, y: newY, angle: angleInDegrees };
          else
            return { x: newX, y: newY, angle: prev.angle };
        }
        else
          return { x: newX, y: newY, angle: prev.angle };
      } else {
        return prev;
      }
    });
  }

  return (
    <>
      {
        users.map((user, i) => {
          return (
            <AnimatePresence>
              <motion.div
                key={user.uniqueId}
                id={"prelobbyUser-" + i}
                className={`
                  ${classes.user}
                  ${classes.grab}
                `}
                drag
                dragConstraints={customRef}
                dragSnapToOrigin={false}
                dragPropagation={false}
                dragElastic={0.1}
                whileDrag={{
                  scale: 1.2,
                  backgroundColor: user.self ? 'rgba(204,102,0,1)' : 'rgba(255,171,43,1)',
                }}
                onDragStart={(e) => {
                  const target = document.getElementById("prelobbyUser-" + i);
                  target.classList.add(classes.grabbing);
                  target.classList.remove(classes.grab);
                }}
                onDrag={(e) => { calculateIconRotation(e, i) }}
                onDragEnd={(e) => {
                  const target = document.getElementById("prelobbyUser-" + i);
                  target.classList.remove(classes.grabbing);
                  target.classList.add(classes.grab);
                }}
                style={{
                  left: ((i * 3) + 4) + 'rem',
                }}
                initial={{ opacity: 0, scale: 0.0 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0, scale: 0.0 }}
              >
                <Badge
                  invisible={!user.self}
                  badgeContent={t("YOU")}
                  color="primary"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    transform: `rotate(${((userAngles && Number(userAngles[i]) !== 0 ? Number(Math.floor(userAngles[i])) : -90) + 90)}deg)`,
                  }}
                >
                  {/* <Person /> */}
                  {user.img && user.img.length > 0 ? <img src={user.img} alt={user.name} onDragStart={(e) => e.preventDefault()} /> : <Person />}
                </Badge>
              </motion.div>
            </AnimatePresence>
          )
        })
      }
    </>
  )
}

export default Users;