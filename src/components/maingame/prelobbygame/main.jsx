import "./main.css";

import { useRef, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Typography, Badge } from "@mui/material";
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

  useEffect(() => {
    console.log("dragDirection", dragDirection)
  }, [dragDirection])

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
                if (!user.angle) user.angle = 0;
                const target = document.getElementById("prelobbyUser-" + i);
                target.classList.add("grabbing");
                target.classList.remove("grab");
              }}
              onDrag={(e) => {
                if (!user.angle) user.angle = 0;
                // get direction of drag
                const newX = e.clientX;
                const newY = e.clientY;
                if (newX !== dragDirection.x || newY !== dragDirection.y)
                  setDragDirection((prev) => {
                    // Calculate the angle in radians
                    const angle = Math.atan2(newY - prev.y, newX - prev.x);
                    const angleInDegrees = (angle * (180 / Math.PI) + 360) % 360;
                    // check if the angle is not too different from the previous angle
                    if (Math.abs(angleInDegrees - prev.angle) > 10) {
                      user.angle = angleInDegrees;
                      return { x: newX, y: newY, angle: angleInDegrees };
                    }
                    else
                      return prev;
                  });
              }}
              onDragEnd={(e) => {
                if (!user.angle) user.angle = 0;
                const target = document.getElementById("prelobbyUser-" + i);
                target.classList.remove("grabbing");
                target.classList.add("grab");
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              exit={{ scale: 0 }}
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
                  transform: `rotate(${(user.angle + 90)}deg)`,
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

function PrelobbyGame() {
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const center = constraintsRef.current?.getBoundingClientRect();

  useEffect(() => {
    constraintsRef.current = document.querySelector('.prelobbyContent');
    console.log(center);
    if (center && (center.width !== 0 || center.height !== 0)) {
      setShouldRender(true);
    } else {
      setShouldRender(true);
      setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }
  }, [constraintsRef, center]);

  return (
    <motion.div
      className="prelobbyContainer"
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.1, 1] }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className='prelobbyContentContainer'>
        <div className="prelobbyContentOuter">
          <motion.div className='prelobbyContent' ref={constraintsRef}>
            <Typography variant='h6' className='prelobbyTitle'>Toss users around 🙃</Typography>
            {shouldRender ? <Users customRef={constraintsRef} /> : null}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;