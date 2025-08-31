import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, HashNavigation } from "swiper/modules";
import { Link } from 'react-router-dom'; // Add this import
import "./category.css";
import { FaArrowRight, FaCircleArrowRight } from "react-icons/fa6";
const CategoryData = [
  { title: "programming", Image: "https://i.ibb.co/mGLLb3J/programming.png" },
  { title: "technology", Image: "https://i.ibb.co/RgGYFZX/technology.png" },
  { title: "devops", Image: "https://i.ibb.co/W2gcY2f/devops.png" },
  { title: "travel", Image: "https://i.ibb.co/ch45DSX/airplane.png" },
  { title: "education", Image: "https://i.ibb.co/zxLhYWh/education.png" },
  { title: "lifestyle", Image: "https://i.ibb.co/QjXbcds/lifestyle.png" },
  { title: "fitness", Image: "https://i.ibb.co/4Pszfzw/fitness.png" },
  { title: "fashion", Image: "https://i.ibb.co/VJ7cnjw/dress.png" },
  { title: "food", Image: "https://i.ibb.co/g7MCw38/food.png" },
];

const BlogCategory = () => {
  const swiperRef = useRef(null); // Create reference for Swiper

  return (
    <section className="  mx-auto ">
      <h2 className="capitalize text-white text-xl md:text-2xl lg:text-2xl font-bold text-center mb-6">
        Blog Category
      </h2>
      <div className=" relative md:w-[92%] w-[80%] mx-auto ">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 }, // 1 slide on mobile
            768: { slidesPerView: 2 }, // 2 slides on tablets
            1024: { slidesPerView: 3 }, // 3 slides on laptops
            1280: { slidesPerView: 5 }, // 5 slides on desktops
          }}
          navigation={true}
          modules={[Navigation, HashNavigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }} // Attach swiper instance
          className="mySwiper"
        >
          {CategoryData.map((data, index) => (
            <SwiperSlide key={index}>
              <Link to={`/blogs/category/${data.title}`}>
                <div className="group mx-auto rounded-md border flex flex-col items-center p-5 w-[200px] hover:shadow-lg transition-shadow duration-300 hover:border-[#60A5FA]">
                  <img
                    src={data.Image}
                    alt={data.title}
                    className="w-16 h-16 transition-transform duration-300 transform group-hover:scale-110"
                  />
                  <h3 className="text-gray-700 font-semibold capitalize">
                    {data.title}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          className="absolute top-1/2 -left-8 md:-left-14 transform p-2 -translate-y-1/2 text-white z-50 rounded-full bg-[#F50400] group hover:bg-[#60A5FA] transition-colors duration-300"
          onClick={() => swiperRef.current?.slidePrev()} // Navigate to previous slide
        >
          <FaArrowRight
            className="text-white rotate-180 group-hover:bg-[#60A5FA] rounded-full transition-colors duration-300 bg-[#F50400] "
            size={15}
          />
        </button>

        <button
          className="absolute top-1/2 -right-8 md:-right-14 transform p-2 -translate-y-1/2 text-white z-50 rounded-full bg-[#F50400] group hover:bg-[#60A5FA] transition-colors duration-300"
          onClick={() => swiperRef.current?.slideNext()} // Navigate to next slide
        >
          <FaArrowRight
            size={15}
            className="text-white  group-hover:bg-[#60A5FA] rounded-full transition-colors duration-300 bg-[#F50400] "
          />
        </button>
      </div>
    </section>
  );
};

export default BlogCategory;
