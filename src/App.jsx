import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AddUserPage from "./pages/AddUserPage";
import ViewUsersPage from "./pages/ViewUsersPage";
import UserDetailPage from "./pages/UserDetailPage";
import LoadingSpinner from "./components/LoadingSpinner";
import apiService from "./services/apiservices";

export default function App() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await apiService.getUsers();
      const adaptedUsers = fetchedUsers.map((user) => ({
        ...user,
        id: user._id,
      }));
      setUsers(adaptedUsers);
    } catch (error) {
      toast.error(error.message || "Failed to fetch users.");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (formData, userIdToUpdate) => {
    setIsLoading(true);
    try {
      if (userIdToUpdate) {
        await apiService.updateUser(userIdToUpdate, formData);
        toast.success("User details updated successfully!");
      } else {
        await apiService.addUser(formData);
        toast.success("User data submitted successfully!");
      }
      await fetchUsers();
      return true;
    } catch (error) {
      const errorMessage =
        error.data?.message ||
        error.message ||
        (userIdToUpdate ? "Failed to update user." : "Failed to add user.");
      toast.error(errorMessage);
      console.error("Error submitting user data:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userIdToDelete, navigateInstance) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this user?</p>
        <div className="mt-2">
          <button
            onClick={async () => {
              toast.dismiss();
              setIsLoading(true);
              try {
                if (navigateInstance) {
                  navigateInstance("/users");
                }
                await apiService.deleteUser(userIdToDelete);
                toast.success("User deleted successfully!");
                await fetchUsers();
              } catch (error) {
                toast.error(error.message || "Failed to delete user.");
                console.error("Error deleting user:", error);
              } finally {
                setIsLoading(false);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2 text-sm"
          >
            Yes, delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const downloadUsersPDF = () => {
    // --- Check if there are any users to download ---
    if (!users || users.length === 0) {
      toast.info("No users to download.");
      return;
    }
    if (
      typeof window.jspdf === "undefined" ||
      typeof window.jspdf.jsPDF === "undefined"
    ) {
      toast.error("PDF generation library (jspdf) is not loaded.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    if (typeof doc.autoTable === "undefined") {
      toast.error(
        "PDF table generation library (jspdf-autotable) is not loaded."
      );
      return;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const titleText = "User Data Report";
    doc.setFontSize(16);
    const titleWidth = doc.getTextWidth(titleText);
    const centeredTitleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, centeredTitleX, 15);

    const tableColumn = [
      "ID",
      "Name",
      "Father's Name",
      "CNIC",
      "Phone",
      "Address",
      "Degree",
      "Semester",
      "University",
    ];
    const tableRows = users.map((user) => [
      user.id,
      user.name,
      user.fatherName,
      user.cnic,
      user.phone,
      user.address,
      user.degree,
      user.semester,
      user.university,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      theme: "grid",
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 30 }, // Father's Name
        3: { cellWidth: 28 }, // CNIC
        4: { cellWidth: 22 }, // Phone
        5: { cellWidth: 55 }, // Address
        6: { cellWidth: 32 }, // Degree
        7: { cellWidth: 17 }, // Semester
        8: { cellWidth: 40 }, // University
      },
      didParseCell: function (data) {
        if (data.section !== "head") {
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
    });
    doc.save("user_data_report.pdf");
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Navbar onDownloadPDF={downloadUsersPDF} />

        <main className="flex-grow min-h-[88vh] p-4 md:p-8 pt-20 md:pt-24">
          {isLoading && <LoadingSpinner />}
          {!isLoading && (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/users"
                element={
                  <ViewUsersPage
                    users={users}
                    onDeleteUser={handleDeleteUser}
                  />
                }
              />
              <Route
                path="/users/add"
                element={<AddUserPage onFormSubmit={handleUserSubmit} />}
              />
              <Route
                path="/users/edit/:userId"
                element={<AddUserPage onFormSubmit={handleUserSubmit} />}
              />
              <Route
                path="/users/:userId"
                element={<UserDetailPage onDeleteUser={handleDeleteUser} />}
              />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}
