import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VNPayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVNPayReturn = async () => {
      try {
        const { data } = await axios.get(`/api/user/vnpay-return${location.search}`);

        if (data.success) {
          toast.success('Payment successful');
          navigate('/my-appoinments');
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };

    handleVNPayReturn();
  }, [location, navigate]);

  return <div>Processing payment...</div>;
};

export default VNPayReturn;