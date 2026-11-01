import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../Pages/Redux/Categories/categorySlice";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, HashNavigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi2";
import { LuGrid } from "react-icons/lu";

const fallbackCategories = [
  { title: "programming", image: "https://i.ibb.co/mGLLb3J/programming.png", label: "Programming" },
  { title: "technology", image: "https://i.ibb.co/RgGYFZX/technology.png", label: "Technology" },
  { title: "devops", image: "https://i.ibb.co/W2gcY2f/devops.png", label: "Cloud & DevOps" },
  { title: "travel", image: "https://i.ibb.co/ch45DSX/airplane.png", label: "Travel & Tours" },
  { title: "education", image: "https://i.ibb.co/zxLhYWh/education.png", label: "Education" },
  { title: "lifestyle", image: "https://i.ibb.co/QjXbcds/lifestyle.png", label: "Lifestyle" },
  { title: "fitness", image: "https://i.ibb.co/4Pszfzw/fitness.png", label: "Health & Fitness" },
  { title: "fashion", image: "https://i.ibb.co/VJ7cnjw/dress.png", label: "Fashion & Trends" },
  { title: "food", image: "https://i.ibb.co/g7MCw38/food.png", label: "Food & Culinary" },
];

const BlogCategory = () => {
  const swiperRef = useRef(null);
  const dispatch = useDispatch();
  const { categories = [], isLoading } = useSelector((state) => state.Categories);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const displayList = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold mb-2">
            <LuGrid className="text-xs" />
            <span>Topics & Niches</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Dive into focused articles, tutorials, and discussions sorted by your favorite subjects.
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand hover:border-brand/40 shadow-sm flex items-center justify-center transition-all duration-200 focus:outline-none"
            aria-label="Previous Category"
          >
            <HiArrowLeft className="text-base" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand hover:border-brand/40 shadow-sm flex items-center justify-center transition-all duration-200 focus:outline-none"
            aria-label="Next Category"
          >
            <HiArrowRight className="text-base" />
          </button>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="relative">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.3}
          breakpoints={{
            480: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
            1536: { slidesPerView: 6 },
            1800: { slidesPerView: 7 },
          }}
          modules={[Navigation, HashNavigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="pb-4"
        >
          {displayList.map((data, index) => (
            <SwiperSlide key={data._id || index}>
              <Link
                to={`/blogs/category/${data.title}`}
                className="group block h-full focus:outline-none"
              >
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-brand/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 mb-3 group-hover:bg-brand-light/50 transition-colors">
                    {data.image || data.Image ? (
                      <img
                        src={data.image || data.Image}
                        alt={data.label}
                        className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <span
                      className="text-2xl"
                      style={{ display: data.image || data.Image ? "none" : "block" }}
                    >
                      {data.icon || "📌"}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand transition-colors capitalize">
                    {data.label}
                  </h3>
                  <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600 transition-colors">
                    View stories &rarr;
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default BlogCategory;
