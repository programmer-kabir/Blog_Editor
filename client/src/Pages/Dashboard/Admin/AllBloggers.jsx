import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/Users/userSlice";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDate } from "../../../Components/DateFomate/DateFormate";
import TableSkeleton from "../../../Components/Loader/TableSkeleton";
import {
  LuPenSquare,
  LuSearch,
  LuTrash2,
  LuShield,
  LuChevronLeft,
  LuChevronRight,
  LuPhone,
  LuMail,
  LuCheckCircle2,
} from "react-icons/lu";

const AllBloggers = () => {
  const dispatch = useDispatch();
  const { isUsersLoading, Users = [] } = useSelector((state) => state.Users);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bloggersPerPage = 8;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const bloggers = Users.filter((user) => user.role === "blogger");

  const displayedBloggers = bloggers.filter(
    (b) =>
      b?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b?.number?.includes(searchTerm)
  );

  const totalPages = Math.ceil(displayedBloggers.length / bloggersPerPage) || 1;
  const indexOfLast = currentPage * bloggersPerPage;
  const indexOfFirst = indexOfLast - bloggersPerPage;
  const currentBloggers = displayedBloggers.slice(indexOfFirst, indexOfLast);

  const handleMakeAdmin = (targetUser) => {
    Swal.fire({
      title: "Grant Administrator Privileges?",
      text: `Are you sure you want to promote creator ${targetUser?.name || targetUser?.email} to Admin?`,
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
              toast.success(`${targetUser?.name || "Blogger"} is now an Administrator!`);
              dispatch(fetchUsers());
            } else {
              toast.error(data.message || "Failed to promote blogger");
            }
          })
          .catch(() => toast.error("Error promoting blogger"));
      }
    });
  };

  const handleDelete = (email, name) => {
    Swal.fire({
      title: "Confirm Creator Deletion",
      text: `Are you sure you want to delete creator ${name || email}? Their blogger access will be permanently revoked.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete Creator",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${import.meta.env.VITE_API_URL}/users/${email}`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("access-token")}`,
            },
          })
          .then((res) => {
            toast.success(res.data?.message || "Creator removed successfully");
            dispatch(fetchUsers());
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Failed to delete creator");
          });
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Content Creators & Bloggers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage authorized bloggers with publishing privileges across the platform.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
          <LuPenSquare className="text-sm" />
          <span>{bloggers.length} verified creators</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search creators by name, email or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
          />
        </div>
      </div>

      {/* Table */}
      {isUsersLoading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : displayedBloggers.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-2">
          <LuPenSquare className="text-3xl text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Creators Found</h3>
          <p className="text-xs text-slate-500">
            {searchTerm
              ? `No creators match your query "${searchTerm}".`
              : "No users currently hold the blogger role."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role Badge</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {currentBloggers.map((blogger) => (
                  <tr key={blogger._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Creator Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {blogger.photo ? (
                          <img
                            src={blogger.photo}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center ring-2 ring-slate-100 flex-shrink-0">
                            {(blogger.name || blogger.email || "B").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {blogger.name || "Blogger"}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <LuMail className="text-slate-400" />
                            {blogger.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {blogger.number ? (
                        <span className="flex items-center gap-1">
                          <LuPhone className="text-slate-400 text-xs" />
                          {blogger.number}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </td>

                    {/* Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                        <LuCheckCircle2 /> Creator
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {blogger.date ? formatDate(blogger.date) : "Recent"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Make Admin */}
                        <button
                          onClick={() => handleMakeAdmin(blogger)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-brand bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Promote Creator to Admin"
                        >
                          <LuShield className="text-xs" />
                          <span>Make Admin</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(blogger.email, blogger.name)}
                          className="inline-flex items-center gap-1 p-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                          title="Delete Creator"
                        >
                          <LuTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, displayedBloggers.length)} of {displayedBloggers.length} creators
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

export default AllBloggers;
