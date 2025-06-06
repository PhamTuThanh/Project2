import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({children}) => {
    
    const [aToken, setAToken] = useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [appoinments, setAppoinments] = useState([])
    const [dashData, setDashData] = useState(false)

    const getAllDoctors = async ()=>{
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, {headers:{aToken}})
            if (data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
                toast.error(error.message)
        }
    }

    const changeAvailability = async (docId)=>{
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/change-availability', {docId}, {headers:{aToken}})
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
                
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppoinments = async ()=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/admin/appoinments', {headers:{aToken}})
            if(data.success){
                setAppoinments(data.appoinments)
                console.log(data.appoinments)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const cancelAppoinment = async (appoinmentId)=>{
        try {
            const {data} = await axios.post(backendUrl+'/api/admin/cancel-appoinment',{appoinmentId}, {headers:{aToken}})
            if (data.success) {
                toast.success(data.message)
                getAllAppoinments()
            } else {
                toast.error(data.message)
                
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const getDashData = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/admin/dashboard', {headers:{aToken}})
            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const deleteDoctor = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-doctor', { docId }, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors(); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
   
    const value = {
        aToken, setAToken,
        backendUrl,doctors,
        getAllDoctors, changeAvailability,
        appoinments, setAppoinments,
        getAllAppoinments, cancelAppoinment,
        dashData, getDashData, deleteDoctor
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;