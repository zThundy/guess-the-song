
import classes from './main.module.css'

import { useEffect, useState } from 'react'

import Header from '../maingameheader/main'

import { motion } from 'framer-motion'
import { Button, TextField } from '@mui/material'

const { setCookie, getCookie } = require("@helpers/cookies")
const api = require("@helpers/api")

export default function MainAccount() {
  const [canNavigateBack, setCanNavigateBack] = useState(true)
  const [username, setUsername] = useState(getCookie('username'))
  const [userImage, setUserImage] = useState(getCookie('userImage'))

  const [hasUsernameChanged, setHasUsernameChanged] = useState(false)
  const [hasUserImageChanged, setHasUserImageChanged] = useState(false)

  useEffect(() => {
    if (username !== getCookie('username')) {
      setCanNavigateBack(false)
      setHasUsernameChanged("Please save changes")
    } else {
      setHasUsernameChanged(false)
    }
    if (userImage !== getCookie('userImage')) {
      setCanNavigateBack(false)
      const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|)/g)
      if (regex.test(userImage)) {
        setHasUserImageChanged("Please save changes")
      } else {
        setHasUserImageChanged("Invalid URL")
      }
    } else {
      setHasUserImageChanged(false)
    }
  }, [username, userImage])

  const onClickBack = ({ event, location }) => {}

  const updateUsername = (e) => {
    // prevent spaces in username
    if (e.target.value.includes(' ')) e.target.value = e.target.value.replace(' ', '_')
    setUsername(e.target.value)
    // setCookie('username', e.target.value, 365)
  }

  const updateUserImage = (e) => {
    const url = e.target.value
    setUserImage(url)
  }

  const saveChanges = () => {
    if (hasUsernameChanged) {
      if (username.includes(' ')) {
        setUsername(username.replace(' ', '_'))
      }
      if (username.length < 3) {
        setHasUsernameChanged("Username must be at least 3 characters long")
        return
      }
      if (username.length > 20) {
        setHasUsernameChanged("Username must be less than 20 characters long")
        return
      }
      setCookie('username', username, 365)
      api.updateUsername()
      setHasUsernameChanged(false)
    }
    if (hasUserImageChanged) {
      const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)
      if (regex.test(userImage)) {
        setHasUserImageChanged(false)
        setCookie('userImage', userImage, 365)
      } else {
        if (userImage.length === 0) {
          setHasUserImageChanged(false)
          setCookie('userImage', userImage, 365)
        } else {
          setHasUserImageChanged("Invalid URL")
        }
      }
    }
    setHasUsernameChanged((usr) => {
      setHasUserImageChanged((prv) => {
        if (!usr && !prv) {
          setCanNavigateBack(true)
        }
        return prv
      })
      return usr
    })
  }

  return (
    <motion.div
      className={classes.container}
      initial={{ x: -3000, opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -3000, opacity: 1 }}
    >
      <Header onClickBack={onClickBack} canNavigate={canNavigateBack} />
      <div className={classes.content}>
        <div className={classes.inputContainer}>
          <div className={classes.inputTitle}>Username</div>
          <div
            className={classes.inputDescription}
            style={{ color: 'gray' }}
          >Your user data is stored in the cookies</div>
          <div
            className={classes.inputFieldButton}
          >
            <TextField
              className={classes.input}
              placeholder='Type a username'
              onChange={updateUsername}
              value={username}
              error={hasUsernameChanged.length > 0}
              helperText={hasUsernameChanged}
            ></TextField>
            <Button
              className={classes.saveButton}
              variant='contained'
              onClick={saveChanges}
            >Save</Button>
          </div>
        </div>
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
              error={hasUserImageChanged.length > 0}
              helperText={hasUserImageChanged}
            ></TextField>
            <Button
              className={classes.saveButton}
              variant='contained'
              onClick={saveChanges}
            >Save</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}