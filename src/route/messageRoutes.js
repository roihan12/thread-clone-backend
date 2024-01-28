import express from "express";
import protectedRoute from "../middleware/protectedRouteMiddleware.js";
import { sendMessage, getMessages, getConversations} from "../controller/messageController.js";

const router = express.Router();

router.get('/conversations', protectedRoute, getConversations)
router.get('/:otherUserId', protectedRoute, getMessages)
router.post('/', protectedRoute, sendMessage)
export default router;
