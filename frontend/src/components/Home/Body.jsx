import React from "react";
import img from "./Images/report.png";

const Body = () => {
  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-20 my-28">
      <div className="flex flex-col md:flex-row items-center justify-between px-9">
        {/* Text Section (Left Side) */}
        <div className="max-w-lg md:w-1/2">
          <h1 className="text-4xl font-bold leading-snug">
            Welcome to{" "}
            <span className="text-green-600 px-2 py-1 rounded-md">
              AmarHealth
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Free web app to manage medication plans, log health data, store
            medical documents, track symptoms, and share information with
            doctors for remote consultations. Stay updated with health advice
            and news.
          </p>
        </div>

        {/* Image Section (Right Side) */}
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src={img} // Replace with actual image URL
            alt="AmerHealth App"
            className="rounded-lg w-[350px] md:w-[450px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Body;
