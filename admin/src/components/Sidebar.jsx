import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import Dashboard from './../pages/Admin/Dashboard';
import { DoctorContext } from '../context/DoctorContext';

const Sidebar = () => {
    const {aToken} = useContext(AdminContext)
    const {dToken} = useContext(DoctorContext)
    const [openTrackHealth, setOpenTrackHealth] = useState(false);
  return (
    <div className='min-h-screen bg-white border-r'>
        {
            aToken && <ul className='text-[#515151] mt-5'>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p className='hidden md:block'>Dashboard</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-appoinment'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p className='hidden md:block'>Appoinment</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-doctor'}>
                    <img src={assets.add_icon} alt="" />
                    <p className='hidden md:block'>Add Doctor</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-list'}>
                    <img src={assets.people_icon} alt="" />
                    <p className='hidden md:block'>Doctors List</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-student'}>
                    <img src={assets.add_icon} alt="" />
                    <p className='hidden md:block'>Add Student</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/student-list'}>
                    <img src={assets.people_icon} alt="" />
                    <p className='hidden md:block'>Students List</p>
                </NavLink>
            </ul>
        }

         {
            dToken && <ul className='text-[#515151] mt-5'>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p className='hidden md:block'>Dashboard</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-appoinments'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p className='hidden md:block'>Appoinment</p>
                </NavLink>

                <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-profile'}>
                    <img src={assets.people_icon} alt="" />
                    <p className='hidden md:block'>Profile</p>
                </NavLink>

                <li>
                  <div
                    className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer select-none ${openTrackHealth ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    onClick={() => setOpenTrackHealth(!openTrackHealth)}
                  >
                    <img src={assets.add_icon} alt="" />
                    <span className='hidden md:block flex-1'>Tracking health</span>
                    <span className='ml-auto'>{openTrackHealth ? '▾' : '▸'}</span>
                  </div>
                  {openTrackHealth && (
                    <ul className="ml-8 mt-1 text-[15px] text-gray-700">
                      <li className="py-1">
                        <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-physical-fitness'}>
                          Physical fitness
                        </NavLink>
                      </li>
                      <li className="py-1">
                          <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/abnormality'}>
                          Abnormality
                        </NavLink>
                      </li>
                      <li className="py-1">
                        <NavLink className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ?  'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/specialist_consultation'}>
                          Specialist consultation
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
            </ul>
        }
    </div>
  )
}

export default Sidebar
