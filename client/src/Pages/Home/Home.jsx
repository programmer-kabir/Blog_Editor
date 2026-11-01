import React from "react";
import Banner from "../../Components/Home/Banner/Banner";
import TrendingBlog from "../../Components/Home/TrendingBlog/TrendingBlog";
import InfoCard from "../../Components/Home/InfoCard/InfoCard";
import BlogCategory from "../../Components/Home/BlogCategory/BlogCategory";
import PopularBlog from "../../Components/Home/PopularBlog/PopularBlog";
import Newsletter from "../../Components/Home/Newsletter/Newsletter";
import CompanyInfo from "../../Components/Home/CompanyInfo/CompanyInfo";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Section */}
      <Banner />

      {/* Main Container */}
      <main className="w-[94%] md:w-[95%] max-w-[1750px] mx-auto space-y-14 sm:space-y-20 py-8">
        <TrendingBlog />
        <InfoCard />
        <BlogCategory />
        <PopularBlog />
        <Newsletter />
        <CompanyInfo />
      </main>
    </div>
  );
};

export default Home;
