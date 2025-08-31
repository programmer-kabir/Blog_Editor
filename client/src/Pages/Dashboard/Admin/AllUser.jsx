import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/Users/userSlice";
import toast from "react-hot-toast";
import { formatDate } from "../../../Components/DateFomate/DateFormate";
const AllUser = () => {
  const dispatch = useDispatch();
  const { isUsersLoading, Users, isUsersError } = useSelector(
    (state) => state.Users
  );
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, Users]);
  const [user, setUsers] = useState(Users);

  useEffect(() => {
    setUsers(Users);
  }, [Users]);

  const handleMakeAdmin = (user) => {
    // console.log(user);
    fetch(`https://blogs-editor-server.vercel.app/users/admin/${user?._id}`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.modifiedCount) {
          // Updating the user in the local state
          toast.success(`${user?.name} is now Admin !!`);
          const updatedUsers = Users.map((u) => {
            if (u._id === user._id) {
              return { ...u, role: "admin" };
            }
            return u;
          });
          setUsers(updatedUsers);
        }
      });
  };

  return (
    <section className="pt-10">
      <div className="w-[95%] mx-auto">
        <div className="relative overflow-x-auto border-t border-l border-r rounded">
          <table className="w-full text-sm text-left text-gray-500 ">
            <thead className="text-base  text-[#737373] uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Contact Number
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {Users.map((user) => (
                <tr key={user._id} className="bg-white border-b">
                  <td
                    scope="row"
                    className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap "
                  >
                    <img
                      className="w-10 h-10 rounded-md"
                      src={user.photo}
                      alt=""
                    />
                  </td>
                  <td className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap ">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap ">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap ">
                    {user.number}
                  </td>
                  <td className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap ">
                    {formatDate(user.date)}
                  </td>
                  <td className="px-6 py-4 font-normal text-gray-900 whitespace-nowrap ">
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-200 hover:bg-cyan-400 hover:text-gray-600 transition-colors duration-500 px-2 py-1 text-xs font-semibold  text-cyan-600">
                        {user.role}
                      </span>

                      {user.role !== "admin" && (
                        <span
                          onClick={() => handleMakeAdmin(user)}
                          className="inline-flex items-center gap-1 rounded-full bg-cyan-200 hover:bg-cyan-400 hover:text-gray-600 transition-colors duration-500 px-2 py-1 text-xs font-semibold  text-cyan-600"
                        >
                          {user.role !== "admin" && <>Make Admin</>}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AllUser;
