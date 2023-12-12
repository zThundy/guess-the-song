import "./main.css";

import { useRef, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Typography } from "@mui/material";

function Users({ customRef }) {
  const [users, setUsers] = useState([{ self: true, name: 'You' }]);

  return (
    <>
      {
        users.map((user, i) => {
          return (
            <motion.div
              key={i}
              className="prelobbyUser"
              drag
              dragConstraints={customRef}
              dragSnapToOrigin={false}
              dragElastic={0.1}
              whileDrag={{
                scale: 1.2,
                backgroundColor: user.self ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)',
              }}
              onMouseDown={(e) => {
                e.target.style.cursor = 'grabbing';
                e.target.style.zIndex = 100;
              }}
              onMouseUp={(e) => {
                e.target.style.cursor = 'grab';
                e.target.style.zIndex = 0;
              }}
              onMouseEnter={(e) => {
                e.target.style.cursor = 'grab';
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              exit={{ scale: 0 }}
              style={{
                left: ((i * 3) + 4) + 'rem',
              }}
            >
              {i}
            </motion.div>
          )
        })
      }
    </>
  )
}

function PrelobbyGame() {
  const constraintsRef = useRef(null);
  const center = constraintsRef.current?.getBoundingClientRect();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (constraintsRef.current) {
      // this forces the element to rerender because of the new value
      setReady(true);
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
            {
              ready ? <Users customRef={constraintsRef} /> : null
            }
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;