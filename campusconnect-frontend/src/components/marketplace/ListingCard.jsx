import { Link } from "react-router-dom"

const conditionConfig = {
  new:  { label: "Like new", bg: "bg-[#EEEDFE]", text: "text-[#3C3489]" },
  good: { label: "Good",     bg: "bg-[#EAF3DE]", text: "text-[#27500A]" },
  fair: { label: "Fair",     bg: "bg-[#FAEEDA]", text: "text-[#633806]" },
  poor: { label: "Poor",     bg: "bg-[#FCEBEB]", text: "text-[#791F1F]" },
}

const categoryEmoji = {
  textbook:    "📘",
  calculator:  "🔢",
  lab:         "🧪",
  electronics: "💻",
  stationery:  "✏️",
  other:       "📦",
}

export default function ListingCard({ listing }) {
  const condition = conditionConfig[listing.condition] || conditionConfig.good
  const emoji = categoryEmoji[listing.category] || "📦"
  const discount = listing.mrp
    ? Math.round(((listing.mrp - listing.price) / listing.mrp) * 100)
    : null

  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#534AB7] hover:shadow-sm transition-all cursor-pointer">

        {/* Image / Emoji area */}
        <div
          className="h-36 flex items-center justify-center text-5xl"
          style={{ background: "#EEEDFE" }}
        >
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{emoji}</span>
          )}
        </div>

        {/* Body */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
              {listing.title}
            </h3>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            {listing.department} · Sem {listing.semester}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-medium text-[#3C3489]">
                ₹{listing.price}
              </span>
              {listing.mrp && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{listing.mrp}
                </span>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${condition.bg} ${condition.text}`}>
              {condition.label}
            </span>
          </div>

          {discount && discount > 0 && (
            <div className="mt-2">
              <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-2 py-0.5 rounded-full">
                {discount}% off
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}