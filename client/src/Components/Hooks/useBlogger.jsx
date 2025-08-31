import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";

const useBlogger = () => {
  const { user, loading } = useAuth();
  // console.log(user);
  const [axiosSecure] = useAxiosSecure();
  const { data: isBlogger, isLoading: isBloggerLoading } = useQuery({
    queryKey: ["isBlogger", user?.email],
    enabled: !loading,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/blogger/${user?.email}`);
      return res?.data?.blogger;
    },
  });
//   console.log(isAdmin);
  return [isBlogger, isBloggerLoading];
};
export default useBlogger;