import Message from "../models/Message.js"

// Get all conversations (unique users tumne baat ki hai)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate("sender", "name department year")
      .populate("receiver", "name department year")
      .populate("listing", "title images")
      .sort({ createdAt: -1 })

    // Unique conversations nikalo
    const conversationMap = {}
    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId.toString()
        ? msg.receiver
        : msg.sender

      const key = otherUser._id.toString()
      if (!conversationMap[key]) {
        conversationMap[key] = {
          user: otherUser,
          lastMessage: msg,
          listing: msg.listing,
          unread: 0,
        }
      }
      if (!msg.isRead && msg.receiver._id.toString() === userId.toString()) {
        conversationMap[key].unread++
      }
    })

    res.json(Object.values(conversationMap))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get messages between 2 users
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id
    const { otherUserId } = req.params

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ]
    })
      .populate("sender", "name")
      .populate("listing", "title images price")
      .sort({ createdAt: 1 })

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true }
    )

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, listingId } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" })
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
      listing: listingId || null,
    })

    const populated = await message.populate([
      { path: "sender", select: "name" },
      { path: "listing", select: "title images price" },
    ])

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}