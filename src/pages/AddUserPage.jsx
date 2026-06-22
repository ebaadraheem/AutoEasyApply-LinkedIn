import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import apiService from "../services/apiservices";

function AddUserPage({ onFormSubmit }) { 
  const { userId } = useParams();
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    phone: "",
    address: "",
    degree: "",
    semester: "",
    university: "",
  });

  useEffect(() => {
    if (userId) {
      setIsEditMode(true);
      setIsLoading(true);
      apiService.getUserById(userId)
        .then(userData => {
          setFormData({
            name: userData.name || "",
            fatherName: userData.fatherName || "",
            cnic: userData.cnic || "",
            phone: userData.phone || "",
            address: userData.address || "",
            degree: userData.degree || "",
            semester: userData.semester || "",
            university: userData.university || "",
          });
        })
        .catch(error => {
          toast.error(error.message || "Failed to fetch user details for editing.");
          navigate('/users');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsEditMode(false);
      setFormData({
        name: "",
        fatherName: "",
        cnic: "",
        phone: "",
        address: "",
        degree: "",
        semester: "",
        university: "",
      });
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (typeof formData[key] === 'string' && formData[key].trim() === "") {
        toast.warn(
          `Please fill in the ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`
        );
        return;
      }
    }
    if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      toast.warn("Please enter a valid CNIC (e.g., 12345-1234567-1).");
      return;
    }
    if (!/^(03\d{2}-\d{7})$/.test(formData.phone)) {
      toast.warn("Please enter a valid phone number (e.g., 0300-1234567).");
      return;
    }

    setIsLoading(true);
    const success = await onFormSubmit(formData, isEditMode ? userId : null);
    setIsLoading(false);

    if (success) {
      navigate("/users");
    }
  };

  const inputFields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "fatherName", label: "Father's Name", type: "text", placeholder: "e.g., Richard Doe" },
    { name: "cnic", label: "CNIC (XXXXX-XXXXXXX-X)", type: "text", placeholder: "e.g., 35202-1234567-1" },
    { name: "phone", label: "Phone No (03XX-XXXXXXX)", type: "tel", placeholder: "e.g., 0300-1234567" },
    { name: "address", label: "Full Address", type: "text", placeholder: "e.g., House 123, Street 4, City" },
    { name: "degree", label: "Degree Program", type: "text", placeholder: "e.g., BS Computer Science" },
    { name: "semester", label: "Current Semester", type: "text", placeholder: "e.g., 5th" },
    { name: "university", label: "University Name", type: "text", placeholder: "e.g., National University" },
  ];

  if (isLoading && isEditMode && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">
        {isEditMode ? "Edit User Details" : "Add New User"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {inputFields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              id={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150"
              required
              disabled={isLoading && !isEditMode} 
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full cursor-pointer bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-70"
          disabled={isLoading} 
        >
          {isLoading && ! (isEditMode && !formData.name) ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update Details" : "Submit Details")}
        </button>
      </form>
    </div>
  );
}

export default AddUserPage;