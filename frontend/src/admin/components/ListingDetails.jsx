import { Link } from "react-router-dom";


export default function ListingCard({
  listing,
  onToggleStatus,
  onDelete,
}) {

  if (!listing) return null;

 const getImageUrl = (path) => {
  if (!path) {
    return "https://via.placeholder.com/400x300?text=No+Image";
  }

  const base =
    import.meta.env.VITE_API_URL || "";

  if (
    typeof path === "string" &&
    path.startsWith("http")
  ) {
    return path;
  }

  return (
    base.replace(/\/$/, "") +
    "/" +
    String(path).replace(/^\//, "")
  );
};
  const image =
  listing?.photos?.length > 0
    ? getImageUrl(
        listing.photos[0]?.url
      )
    : "https://via.placeholder.com/400x300?text=No+Image";
  // console.log("photos:", listing.photos);
  // console.log("image url:", image);
  const price =
    listing?.rates && listing.rates.length > 0
      ? `$${listing.rates[0].nightly}/night`
      : "Call for price";

  return (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition flex flex-col md:flex-row overflow-hidden">

  {/* LEFT IMAGE */}
  
 <div className="md:w-56 w-full relative">

  <img
    src={image}
    alt="listing"
    className="w-full h-48 md:h-full object-cover"
  />

  {/* EDIT BUTTON */}
  <Link
    to={`/admin/listings/${listing._id}`}
    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-lg text-sm shadow hover:bg-orange-600"
  >
    Edit
  </Link>

</div>
  
  

  {/* RIGHT SIDE */}
  <div className="flex-1 p-5 flex flex-col justify-between">

    {/* TOP INFO */}
    <div>
      <h2 className="text-xl font-semibold text-green-700 mb-3">
        {listing?.property?.title}
      </h2>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">

        {/* <p><span className="font-medium">ID:</span> #{listing._id.slice(-5)}</p> */}

        <p>
          <span className="font-medium">Approval:</span>{" "}
          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
            Approved
          </span>
        </p>

        <p>
          <span className="font-medium">Status:</span>{" "}
          <span className="bg-gray-500 text-white px-2 py-0.5 rounded text-xs">
            {listing.status}
          </span>
        </p>

        <p>
          <span className="font-medium">Added:</span>{" "}
          {new Date(listing.createdAt).toLocaleDateString()}
        </p>

        <p className="md:col-span-2">
          <span className="font-medium">Updated:</span>{" "}
          {new Date(listing.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div> 

    {/* ACTION LINKS */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-500  mt-4">

     <p className=""> <Link to={`/admin/listings/${listing._id}`} >Details</Link></p>
      <Link to={`/admin/listings/${listing._id}?tab=Description`}>Description</Link>

      <Link to={`/admin/listings/${listing._id}?tab=Amenities`}>Amenities</Link>
      <Link to={`/admin/listings/${listing._id}?tab=Activities`}>Activities</Link>

      <Link to={`/admin/listings/${listing._id}?tab=Photos`}>Photos</Link>
      <Link to={`/admin/listings/${listing._id}?tab=Video`}>Video</Link>

      <Link to={`/admin/listings/${listing._id}?tab=Rates`}>Rates</Link>
      <Link to={`/admin/listings/${listing._id}?tab=Location`}>Location</Link>

     <div className="flex items-center gap-2">
  <Link to={`/admin/listings/${listing._id}?tab=Reviews`}>
    Reviews
  </Link>

  {listing.reviewCount > 0 && (
    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
      {listing.reviewCount} New
    </span>
  )}
</div>
      <div className="flex items-center gap-2">
  <Link to={`/admin/listings/${listing._id}?tab=Inquiry`}>
    Inquiry
  </Link>

  {listing.inquiryCount > 0 && (
    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
      {listing.inquiryCount} New
    </span>
  )}
</div>
    </div>

    {/* FOOTER */}
    <div className="flex justify-between items-center mt-5">

      {/* TOGGLE */}
      <button
        onClick={() => onToggleStatus(listing._id)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          listing.status === "published"
            ? "bg-green-500"
            : "bg-gray-400"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
            listing.status === "published"
              ? "translate-x-6"
              : ""
          }`}
        />
      </button>

      
    </div>

  </div>
</div>
  );
}
