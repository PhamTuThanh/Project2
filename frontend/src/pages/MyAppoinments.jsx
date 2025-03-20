import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppoinments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appoinments, setAppoinments] = useState([]);
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  const getUserAppoinments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appoinments', { headers: { token } });
      if (data.success) {
        setAppoinments(data.appoinments.reverse());
        console.log(data.appoinments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppoinment = async (appoinmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appoinment', { appoinmentId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        getUserAppoinments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleVNPayPayment = async (appoinment) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/make-vnpay-payment', {
        userId: appoinment.userId,
        docId: appoinment.docId,
        slotDate: appoinment.slotDate,
        slotTime: appoinment.slotTime,
      }, { headers: { token } });

      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppoinments();
    }
  }, [token]);

  return (
    <div>
      <p>My appoinment</p>
      <div>
        {
          appoinments.map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date&Time: </span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-center'>
                { !item.cancelled && <button onClick={() => handleVNPayPayment(item)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                { !item.cancelled && <button onClick={() => cancelAppoinment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appoinment</button>}
                { item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appoinment Cancelled</button>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default MyAppoinments;