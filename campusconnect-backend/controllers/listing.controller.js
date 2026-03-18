import Listing from "../models/Listing.js"
import cloudinary from "../config/cloudinary.js"

// Get all listings
export const getListings = async (req, res) => {
  try {
    const { category, department, semester, minPrice, maxPrice, search } = req.query

    let filter = { isAvailable: true }

    if (category) filter.category = category
    if (department) filter.department = department
    if (semester) filter.semester = Number(semester)
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const listings = await Listing.find(filter)
      .populate("seller", "name department year rating")
      .sort({ createdAt: -1 })

    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single listing
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("seller", "name department year rating reviewCount")

    if (!listing) return res.status(404).json({ message: "Listing not found" })

    res.json(listing)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create listing
export const createListing = async (req, res) => {
  try {
    const { title, description, price, mrp, condition, category, department, semester } = req.body

    let images = []

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = file.buffer.toString("base64")
        const dataUri = `data:${file.mimetype};base64,${base64}`
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "campusconnect",
        })
        images.push(result.secure_url)
      }
    }

    const listing = await Listing.create({
      seller: req.user._id,
      title, description,
      price: Number(price),
      mrp: mrp ? Number(mrp) : undefined,
      condition, category,
      department, semester,
      images,
    })

    res.status(201).json(listing)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: "Listing not found" })

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await listing.deleteOne()
    res.json({ message: "Listing deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Toggle availability
export const toggleAvailability = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: "Listing not found" })

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    listing.isAvailable = !listing.isAvailable
    await listing.save()
    res.json(listing)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}