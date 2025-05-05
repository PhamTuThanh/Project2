import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';
import DoctorsList from './pages/Admin/DoctorsList';
import AddDoctor from './pages/Admin/AddDoctor';
import Dashboard from './pages/Admin/Dashboard';
import AllApoinments from './pages/Admin/AllApoinments';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppoinments from './pages/Doctor/DoctorAppoinments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import AddStudent from './pages/Admin/AddStudent';

const App = () => {
  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)

  return aToken || dToken ? (
    <div className='bg-[#f8f9fd]'>
      <ToastContainer />
      <Navbar/>
      <div className='flex items-start'>
         <Sidebar/> 
         <Routes>
          {/* admin route */}
            <Route path='/' element={<></>}/>
            <Route path='/admin-dashboard' element={<Dashboard/>}/>
            <Route path='/all-appoinment' element={<AllApoinments/>}/>
            <Route path='/add-doctor' element={<AddDoctor/>}/>
            <Route path='/doctor-list' element={<DoctorsList/>}/>
            <Route path='/add-student' element={<AddStudent/>}/>
            {/* doctor route */}
            <Route path='/doctor-dashboard' element={<DoctorDashboard/>}/>
            <Route path='/doctor-appoinments' element={<DoctorAppoinments/>}/>
            <Route path='/doctor-profile' element={<DoctorProfile/>}/>
         </Routes>
      </div>
    </div>
  ): (
    <>
      <Login/>
      <ToastContainer/>
    </>
  )
}

export default App
