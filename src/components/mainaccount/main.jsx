
import classes from './main.module.css'

import { useEffect, useState } from 'react'

import Header from '../maingameheader/main'

import { motion } from 'framer-motion'
import { Button, TextField } from '@mui/material'

const { setCookie, getCookie } = require("@helpers/cookies")

export default function MainAccount() {
  const [username, setUsername] = useState(getCookie('username'))
  const [userImage, setUserImage] = useState(getCookie('userImage'))
  const [isValidUrlError, setIsValidUrlError] = useState("")

  const updateUsername = (e) => {
    // prevent spaces in username
    if (e.target.value.includes(' ')) e.target.value = e.target.value.replace(' ', '_')
    setUsername(e.target.value)
    setCookie('username', e.target.value, 365)
  }

  const updateUserImage = (e) => {
    const url = e.target.value
    const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)
    setUserImage(url)
    if (regex.test(url)) {
      setIsValidUrlError('')
      setCookie('userImage', url, 365)
    } else {
      setIsValidUrlError('Invalid URL')
    }
  }

  return (
    <motion.div
      className={classes.container}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header />
      <div className={classes.content}>
        <div className={classes.inputContainer}>
          <div className={classes.inputTitle}>Username</div>
          <div
            className={classes.inputDescription}
            style={{ color: 'gray' }}
          >Your user data is stored in the cookies</div>
          <TextField className={classes.input} value={username} onChange={updateUsername}></TextField>
        </div>
        {/* <div className={classes.inputContainer}>
          <div className={classes.inputTitle}>Password</div>
          <TextField className={classes.input} disabled placeholder='Account is saved in cookies'></TextField>
        </div> */}
        <div className={classes.inputContainer}>
          <div
            className={classes.inputTitle}
            style={{
              marginBottom: ".8rem"
            }}
          >Profile Picture</div>
          <div
            className={classes.inputFieldButton}
          >
            <TextField
              className={classes.input}
              placeholder='Type a picture URL'
              onChange={updateUserImage}
              value={userImage}
              error={isValidUrlError.length > 0}
              helperText={isValidUrlError}
            ></TextField>
            <Button
              className={classes.saveButton}
              variant='contained'
              onClick={() => {
                setCookie('username', username, 365)
                setCookie('userImage', userImage, 365)
              }}
            >Save</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}