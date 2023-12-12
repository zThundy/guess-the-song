import "./main.css";

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { Badge } from "@mui/material";
import { Person } from "@mui/icons-material";

function Users({ customRef }) {
  const [users, setUsers] = useState([
    { self: true, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' },
    { self: false, name: 'You' }
  ]);

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
    if (newX !== dragDirection.x || newY !== dragDirection.y) {
      setDragDirection((prev) => {
        const angle = Math.atan2(newY - prev.y, newX - prev.x);
        const angleInDegrees = (angle * (180 / Math.PI) + 360) % 360;
        if (Math.abs(angleInDegrees - prev.angle) > 15) {
          setUserAngles((prev) => {
            const newArray = [...prev];
            if (!newArray[i]) newArray[i] = 0;
            if (String(newArray[i]) !== angleInDegrees) {
              newArray[i] = String(angleInDegrees);
              return newArray;
            }
          });
          return { x: newX, y: newY, angle: angleInDegrees };
        }
        else
          return { x: newX, y: newY, angle: prev.angle };
      });
    }
  }

  return (
    <>
      {
        users.map((user, i) => {
          return (
            <motion.div
              key={i}
              id={"prelobbyUser-" + i}
              className="prelobbyUser grab"
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
                target.classList.add("grabbing");
                target.classList.remove("grab");
              }}
              onDrag={(e) => { calculateIconRotation(e, i) }}
              onDragEnd={(e) => {
                const target = document.getElementById("prelobbyUser-" + i);
                target.classList.remove("grabbing");
                target.classList.add("grab");
              }}
              style={{
                left: ((i * 3) + 4) + 'rem',
              }}
            >
              <Badge
                invisible={!user.self}
                badgeContent="You"
                color="primary"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{
                  transform: `rotate(${((userAngles && Number(userAngles[i]) !== 0 ? Number(Math.floor(userAngles[i])) : -90) + 90)}deg)`,
                }}
              >
                <Person />
              </Badge>
            </motion.div>
          )
        })
      }
    </>
  )
}

export default Users;