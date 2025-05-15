import express from 'express'
import sanitizeInput from '../middleware/sanitizeInput.js'
import * as ParentController from '../controllers/parentController.js'
import * as UsernameController from '../controllers/usernameController.js'
import * as AvatarController from '../controllers/avatarController.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/parent-account', sanitizeInput, asyncHandler(ParentController.createParentAccount))
router.post('/username-check', sanitizeInput, asyncHandler(UsernameController.checkUsername))
router.post('/user-avatar', asyncHandler(AvatarController.createAvatar))

export default router
