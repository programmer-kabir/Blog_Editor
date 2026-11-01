import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/Users/userSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { formatDate } from "../../../Components/DateFomate/DateFormate";
import TableSkeleton from "../../../Components/Loader/TableSkeleton";
import {
  LuUsers,
  LuShieldCheck,
  LuSearch,
  LuTrash2,
  LuShield,
  LuChevronLeft,
  LuChevronRight,
  LuPhone,
  LuMail,
} from "react-icons/lu";

const AllUser = () => {
  const dispatch = useDispatch();
  const { isUsersLoading, Users = [] } = useSelector((state) => state.Users);

  const [activeRoleFilter, setActiveRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const adminCount = Users.filter((u) => u.role === "admin").length;
  const bloggerCount = Users.filter((u) => u.role === "blogger").length;
  const readerCount = Users.filter((u) => u.role === "user" || !u.role).length;

  const handleMakeAdmin = (targetUser) => {
    Swal.fire({
      title: "Grant Administrator Privileges?",
      text: `Are you sure you want to promote ${targetUser?.name || targetUser?.email} to Admin?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F50400",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Promote to Admin",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${import.meta.env.VITE_API_URL}/users/admin/${targetUser?._id}`, {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.modifiedCount) {
              toast.success(`${targetUser?.name || "User"} is now an Administrator!`);
              dispatch(fetchUsers());
            } else {
              toast.error(data.message || "Failed to promote user");
            }
          })
          .catch(() => toast.error("Error promoting user"));
      }
    });
  };

  const handleDeleteUser = (email, name) => {
    Swal.fire({
      title: "Permanently Delete User?",
      text: `Are you sure you want to delete ${name || email}? This will remove their profile and cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete User",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${import.meta.env.VITE_API_URL}/users/${email}`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("access-token")}`,
            },
          })
          .then((res) => {
            toast.success(res.data?.message || "User deleted successfully");
            dispatch(fetchUsers());
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Failed to delete user");
          });
      }
    });
  };

  // Filter by role tab
  const roleFiltered = Users.filter((u) => {
    if (activeRoleFilter === "admin") return u.role === "admin";
    if (activeRoleFilter === "blogger") return u.role === "blogger";
    if (activeRoleFilter === "reader") return u.role === "user" || !u.role;
    return true;
  });

  // Filter by search query
  const displayedUsers = roleFiltered.filter(
    (u) =>
      u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.number?.includes(searchTerm)
  );

  const totalPages = Math.ceil(displayedUsers.length / usersPerPage) || 1;
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = displayedUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Accounts & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View registered community members, promote creators to administrators, and manage access.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
          <LuUsers className="text-sm text-brand" />
          <span>{Users.length} total registered accounts</span>
        </div>
      </div>

      {/* Role Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 max-w-fit">
          <button
            type="button"
            onClick={() => { setActiveRoleFilter("all"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRoleFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Accounts ({Users.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveRoleFilter("admin"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRoleFilter === "admin"
                ? "bg-white text-brand shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => { setActiveRoleFilter("blogger"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRoleFilter === "blogger"
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bloggers ({bloggerCount})
          </button>
          <button
            type="button"
            onClick={() => { setActiveRoleFilter("reader"); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRoleFilter === "reader"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Readers ({readerCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>

      </div>

      {/* Users Table */}
      {isUsersLoading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : displayedUsers.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-2">
          <LuUsers className="text-3xl text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Users Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm
              ? `No user records match your query "${searchTerm}".`
              : "No users exist in this category."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {currentUsers.map((u) => {
                  const roleBadge =
                    u.role === "admin"
                      ? "bg-brand-light text-brand border-brand/20 font-bold"
                      : u.role === "blogger"
                      ? "bg-sky-50 text-sky-700 border-sky-200 font-semibold"
                      : "bg-slate-100 text-slate-700 border-slate-200 font-medium";

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-light text-brand font-bold text-xs flex items-center justify-center ring-2 ring-slate-100 flex-shrink-0">
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {u.name || "Anonymous Member"}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <LuMail className="text-slate-400" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {u.number ? (
                          <span className="flex items-center gap-1">
                            <LuPhone className="text-slate-400 text-xs" />
                            {u.number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${roleBadge}`}>
                          {u.role || "reader"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {u.date ? formatDate(u.date) : "Recent"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Make Admin */}
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleMakeAdmin(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-brand bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                              title="Promote to Admin"
                            >
                              <LuShield className="text-xs" />
                              <span>Make Admin</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u.email, u.name)}
                            className="inline-flex items-center gap-1 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                            title="Delete User"
                          >
                            <LuTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, displayedUsers.length)} of {displayedUsers.length} accounts
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <LuChevronLeft className="text-sm" />
              </button>
              <span className="font-bold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <LuChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;
