import "./main.css";

import Users from "./users/main.jsx";
import StartButton from "./button/main.jsx";

import { useRef, useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Typography } from "@mui/material";

function PrelobbyGame() {
  const constraintsRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);
  const center = constraintsRef.current?.getBoundingClientRect();

  useEffect(() => {
    constraintsRef.current = document.querySelector('.prelobbyContent');
    if (center && (center.width !== 0 || center.height !== 0)) {
      // console.error("REREENDERING")
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

        <StartButton />
      </div>
    </motion.div>
  )
}

export default PrelobbyGame;