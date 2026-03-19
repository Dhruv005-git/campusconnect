import LendItem from "../models/LendItem.js"
import BorrowRequest from "../models/BorrowRequest.js"
import cloudinary from "../config/cloudinary.js"

// Get all lend items
export const getLendItems = async (req, res) => {
  try {
    const { department, category, available } = req.query
    let filter = {}
    if (department) filter.department = department
    if (category) filter.category = category
    if (available === "true") filter.isAvailable = true

    const items = await LendItem.find(filter)
      .populate("owner", "name department year")
      .populate("currentBorrower", "name")
      .sort({ createdAt: -1 })

    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single lend item
export const getLendItem = async (req, res) => {
  try {
    const item = await LendItem.findById(req.params.id)
      .populate("owner", "name department year email")
      .populate("currentBorrower", "name")

    if (!item) return res.status(404).json({ message: "Item not found" })
    res.json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create lend item
export const createLendItem = async (req, res) => {
  try {
    const { title, description, category, department, maxDuration } = req.body

    let images = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = file.buffer.toString("base64")
        const dataUri = `data:${file.mimetype};base64,${base64}`
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "campusconnect/lending",
          access_mode: "public",
        })
        images.push(result.secure_url)
      }
    }

    const item = await LendItem.create({
      owner: req.user._id,
      title, description, category, department,
      maxDuration: Number(maxDuration),
      images,
    })

    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete lend item
export const deleteLendItem = async (req, res) => {
  try {
    const item = await LendItem.findById(req.params.id)
    if (!item) return res.status(404).json({ message: "Item not found" })
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }
    await item.deleteOne()
    res.json({ message: "Item deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Send borrow request
export const sendBorrowRequest = async (req, res) => {
  try {
    const { duration, message } = req.body
    const item = await LendItem.findById(req.params.id)

    if (!item) return res.status(404).json({ message: "Item not found" })
    if (!item.isAvailable) return res.status(400).json({ message: "Item not available" })
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot borrow your own item" })
    }

    // Check if already requested
    const existing = await BorrowRequest.findOne({
      item: item._id,
      borrower: req.user._id,
      status: "pending"
    })
    if (existing) return res.status(400).json({ message: "Request already sent" })

    const request = await BorrowRequest.create({
      item: item._id,
      borrower: req.user._id,
      owner: item.owner,
      duration: Number(duration),
      message,
    })

    res.status(201).json(request)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get my borrow requests (as borrower)
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user._id })
      .populate("item", "title category department images")
      .populate("owner", "name department")
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get requests for my items (as owner)
export const getItemRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.user._id })
      .populate("item", "title category department images")
      .populate("borrower", "name department year")
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Approve / Reject request
export const updateRequest = async (req, res) => {
  try {
    const { status } = req.body
    const request = await BorrowRequest.findById(req.params.requestId)

    if (!request) return res.status(404).json({ message: "Request not found" })
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    request.status = status

    if (status === "approved") {
      const returnDate = new Date()
      returnDate.setDate(returnDate.getDate() + request.duration)
      request.returnDate = returnDate

      await LendItem.findByIdAndUpdate(request.item, {
        isAvailable: false,
        currentBorrower: request.borrower,
        returnDate,
      })
    }

    if (status === "returned") {
      await LendItem.findByIdAndUpdate(request.item, {
        isAvailable: true,
        currentBorrower: null,
        returnDate: null,
      })
    }

    await request.save()
    res.json(request)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}