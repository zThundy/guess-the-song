
import classes from './main.module.css'

import { useEffect, useState } from 'react'

import Header from '../Header/main'

import { motion } from 'framer-motion'
import { Button, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { setCookie, getCookie } from 'helpers/cookies'
import api from 'helpers/api'
import { useEventEmitter } from 'helpers/eventEmitter'
// import { useOnMountUnsafe } from 'helpers/remountUnsafe.jsx'

export default function MainAccount() {
  const { t } = useTranslation();
  const [canNavigateBack, setCanNavigateBack] = useState(true)
  const [username, setUsername] = useState(getCookie('username'))
  const [userImage, setUserImage] = useState(getCookie('userImage'))

  const [hasUsernameChanged, setHasUsernameChanged] = useState(false)
  const [hasUserImageChanged, setHasUserImageChanged] = useState(false)
  const [canSaveImage, setCanSaveImage] = useState(false)

  const eventEmitter = useEventEmitter()

  useEffect(() => {
    if (username !== getCookie('username')) {
      setCanNavigateBack(false)
      setHasUsernameChanged(t("ERROR_SAVE_CHANGES"))
    } else {
      setHasUsernameChanged(false)
    }
    if (userImage !== getCookie('userImage')) {
      setCanNavigateBack(false)
      if (userImage.length > 0) {
        const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|)/g)
        if (regex.test(userImage)) {
          setHasUserImageChanged(t("ERROR_SAVE_CHANGES"))
          setCanSaveImage(true)
        } else {
          setHasUserImageChanged(t("ERROR_INVALID_URL"))
          setCanSaveImage(false)
        }
      } else {
        setHasUserImageChanged(t("ERROR_SAVE_CHANGES"))
        setCanSaveImage(true)
      }
    } else {
      setHasUserImageChanged(false)
    }
  }, [username, userImage])

  const onClickBack = ({ event, location }) => { }

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
        setHasUsernameChanged(t("ERROR_LENGTH_3_USERNAME"))
        return
      }
      if (username.length > 20) {
        setHasUsernameChanged(t("ERROR_LENGTH_20_USERNAME"))
        return
      }
      setCookie('username', username, 365)
      api.updateUsername()
        .then(() => {
          eventEmitter.emit("notify", "success", t("USERNAME_UPDATED"))
        })
        .catch((error) => {
          console.error(error)
          eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"))
        });

      setHasUsernameChanged(false)
    }
    if (hasUserImageChanged && canSaveImage) {
      const regex = new RegExp(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g)
      if (regex.test(userImage)) {
        setHasUserImageChanged(false)
        setCanSaveImage(true)
        setCookie('userImage', userImage, 365)
        api.updateUserImage()
          .then(() => {
            eventEmitter.emit("notify", "success", t("USER_IMAGE_UPDATED"))
          })
          .catch((error) => {
            console.error(error)
            eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"))
          });
      } else {
        if (userImage.length === 0) {
          setHasUserImageChanged(false)
          setCanSaveImage(true)
          setCookie('userImage', userImage, 365)
          api.updateUserImage()
            .then(() => {
              eventEmitter.emit("notify", "success", t("USER_IMAGE_UPDATED"))
            })
            .catch((error) => {
              console.error(error)
              eventEmitter.emit("notify", "error", t(error.key || "GENERIC_ERROR"))
            });
        } else {
          setHasUserImageChanged(t("ERROR_INVALID_URL"))
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
          <div className={classes.inputTitle}>{t("USERNAME")}</div>
          <div
            className={classes.inputDescription}
            style={{ color: 'gray' }}
          >{t("USER_DATA_DESC")}</div>
          <div
            className={classes.inputFieldButton}
          >
            <TextField
              className={classes.input}
              placeholder={t("USERNAME")}
              onChange={updateUsername}
              value={username}
              error={hasUsernameChanged.length > 0}
              helperText={hasUsernameChanged}
            ></TextField>
            <Button
              className={classes.saveButton}
              variant='contained'
              onClick={saveChanges}
            >{t("SAVE")}</Button>
          </div>
        </div>
        <div className={classes.inputContainer}>
          <div
            className={classes.inputTitle}
            style={{
              marginBottom: ".8rem"
            }}
          >{t("PROFILE_PICTURE")}</div>
          <div
            className={classes.inputFieldButton}
          >
            <TextField
              className={classes.input}
              placeholder={t("PROFILE_PICTURE")}
              onChange={updateUserImage}
              value={userImage || ''}
              error={hasUserImageChanged.length > 0}
              helperText={hasUserImageChanged}
            ></TextField>
            <Button
              className={classes.saveButton}
              variant='contained'
              onClick={saveChanges}
            >{t("SAVE")}</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}