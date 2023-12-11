import "./main.css";

import { motion } from 'framer-motion';

function PrelobbyGame() {
  return (
    <motion.div
    className="prelobbyContainer"
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1.1, 1] }}
    exit={{ scale: 0 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    <div className='prelobbyContentContainer'>
      
    </div>
    </motion.div>
  )
}

export default PrelobbyGame;