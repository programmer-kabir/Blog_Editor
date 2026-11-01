import React, { Suspense } from 'react'
import Navbar from '../Pages/Share/Navbar/Navbar'
import Footer from '../Pages/Share/Footer/Footer'
import { Outlet } from 'react-router-dom'
import Loader from '../Components/Loader/Loader'
import TopProgressBar from '../Components/Loader/TopProgressBar'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB]">
        <TopProgressBar />
        <Navbar />
        <main className='flex-1 mt-[65px]'>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
    </div>
  )
}

export default MainLayout
