import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import { ChevronLeft, Edit3, Trash2 } from 'lucide-react'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import { toast } from 'react-toastify';
import apiService from '../services/apiservices'; 

function UserDetailPage({ onDeleteUser }) { 
  const { userId } = useParams(); 
  const navigate = useNavigate(); 

  const [user, setUser] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setIsLoadingDetail(true);
        try {
          const fetchedUser = await apiService.getUserById(userId);
          setUser(fetchedUser);
        } catch (error) {
          toast.error(error.message || "Failed to fetch user details.");
          console.error("Error fetching user details:", error);
          setUser(null);
          if (error.status === 404) {
            navigate('/users', { replace: true }); 
          } else {
            navigate('/users', { replace: true }); 
          }
        } finally {
          setIsLoadingDetail(false);
        }
      };
      fetchUser();
    } else {
      toast.error("No user ID provided in URL.");
      navigate('/users', { replace: true });
      setIsLoadingDetail(false); 
    }
  }, [userId, navigate]); 

  if (isLoadingDetail) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center text-xl text-slate-400 py-10">User not found or unable to load details.</div>;
  }

  const currentUserId = user._id;

  const detailItems = [
    { label: "Full Name", value: user.name },
    { label: "Father's Name", value: user.fatherName },
    { label: "CNIC", value: user.cnic },
    { label: "Phone Number", value: user.phone },
    { label: "Address", value: user.address },
    { label: "Degree Program", value: user.degree },
    { label: "Current Semester", value: user.semester },
    { label: "University", value: user.university },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-slate-800 p-6 md:p-10 rounded-xl shadow-2xl">
      <button
        onClick={() => navigate('/users')} 
        className="flex justify-center cursor-pointer items-center text-sm text-sky-400 hover:text-sky-300 mb-6 transition-colors duration-150"
      >
        <ChevronLeft size={24} className="pt-0.5 mr-1" /> Back to User List
      </button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-700">
        <h2 className="text-3xl font-bold text-sky-400">{user.name}'s Details</h2>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <Link
            to={`/users/edit/${currentUserId}`}
            className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-colors duration-150 text-sm"
          >
            <Edit3 size={16} className="mr-1.5" /> Edit
          </Link>
          <button
            onClick={() => onDeleteUser(currentUserId, navigate)} 
            className="flex cursor-pointer items-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-150 text-sm"
          >
            <Trash2 size={16} className="mr-1.5" /> Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-5">
        {detailItems.map(item => (
          <div key={item.label} className="flex flex-col sm:flex-row">
            <p className="w-full sm:w-1/3 font-semibold text-slate-300">{item.label}:</p>
            <p className="w-full sm:w-2/3 text-slate-200 break-words">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDetailPage;
