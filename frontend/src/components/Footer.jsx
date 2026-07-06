import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useState, useEffect, useRef, use } from "react";
import { FiMail, FiPhone } from "react-icons/fi";
import api from "../api/axios.js";
import { MdEmail } from "react-icons/md";
import { Link, Links } from "react-router-dom";
import logo from "../assets/logo/LOGO.png";

export default function Footer({listingId}) {
    const [contactNumber, setContactNumber] = useState("");
    const [email , setEmail] = useState("");


    useEffect(() => {
  if (!listingId) return;

  api
    .get(`/listings/${listingId}`)
    .then((res) => {

      console.log(res.data);

      // ✅ SAME AS ABOUT SECTION
      setContactNumber(
        res.data?.property?.altPhone || ""
      );
      setEmail(
        res.data?.property?.altEmail || ""
      )

    })
    .catch((err) => {
      console.log(err);
    });

}, [listingId]);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* BRAND */}
          <div>
            <div className=" w-30 mb-0">
              <img src={logo} alt="" srcset="" />
            </div>
            <p className="text-white text-sm mt-6">
             Enjoy a relaxing beachfront escape featuring two king suites, resort-style amenities, breathtaking ocean views, live music, fire pits, and complimentary beach chairs & umbrella.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white text-sm">
              <Link to={"/"}>
                {" "}
                <li className="hover:text-white cursor-pointer">Home</li>
              </Link>
              {/* <li className="hover:text-white cursor-pointer">Properties</li> */}
              <Link to={"/about"}>
                {" "}
                <li className="hover:text-white cursor-pointer">About-us</li>
              </Link>
              <Link to={"/contect-us"}>
                {" "}
                <li className="hover:text-white cursor-pointer">Contact</li>
              </Link>
              <Link to={"/booking-Policy"}>
                {" "}
                {/* <span className="hover:text-white cursor-pointer">
                  Booking Policy
                </span> */}
              </Link>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-black text-sm">
              <Link to="/admin/login">
              <button className="bg-[#FFE8BE] hover:scale-105 transition text-sm font-medium px-4 py-2 rounded shadow flex items-center gap-2 mt-1">
                <MdEmail />
                Owner Login
              </button>
            </Link> 

              {/* <div className="flex items-center gap-2">
                <FiMail />
                <span>{email}</span>
              </div> */}
            </div>
          </div>

          {/* SOCIAL */}
          <div>
          <h3 className="font-semibold mb-4">Our Location</h3>
             <iframe
          className="w-full h-[250px] md:h-[220px]"
         src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d911.3272196319251!2d-85.87424523
038668!3d30.21483089842738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88938c41503ba
a51%3A0x21a40f55ed13dc05!2s15902%20FL-30%2C%20Panama%20City%20Beach%2C%20FL%203
2413%2C%20USA!5e1!3m2!1sen!2sin!4v1778705995783!5m2!1sen!2sin" width="600" height="450">
         
        </iframe>

                           

            {/* <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-blue-600 transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-pink-500 transition"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-sky-500 transition"
              >
                <FaTwitter />
              </a>
            </div> */}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-white text-sm gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            <a href="https://digifyamerica.com/">Digify America</a>. All rights
            reserved.
          </p>

          <div className="flex gap-6">
            {/* <span className="hover:text-white cursor-pointer">Terms</span> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
