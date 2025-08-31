import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BsSlashLg } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../Pages/Redux/Blogs/blogSlice";
import {
  FaBookmark,
  FaComment,
  FaCopy,
  FaFacebook,
  FaLinkedin,
  FaPlus,
  FaRegComment,
  FaShareAlt,
} from "react-icons/fa";
import { BiSolidLike, BiSolidShareAlt } from "react-icons/bi";
import { RiWhatsappFill } from "react-icons/ri";
import useAuth from "../Hooks/useAuth";
import Loader from "../Loader/Loader";
import axios from "axios";
import { fetchUsers } from "../../Pages/Redux/Users/userSlice";
import { calculateMonthDifference } from "../DateFomate/DateFormate";
import toast from "react-hot-toast";
import { fetchComments } from "../../Pages/Redux/Comments/commentSlice";
import ShowComments from "../Dashboard/ShowComments/ShowComments";

const DetailsBlog = () => {
  const { id } = useParams();
  // console.log(id);
  const { user } = useAuth();
  // console.log(user);
  const dispatch = useDispatch();
  const { isBlogLoading, Blogs, isBlogError } = useSelector(
    (state) => state.Blogs
  );

  const { isCommentsLoading, Comments, isCommentsError } = useSelector(
    (state) => state.Comments
  );

  const { isUsersLoading, Users, isUsersError } = useSelector(
    (state) => state.Users
  );

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchUsers());
    dispatch(fetchComments());
  }, [dispatch]);

  const currentBlog = Blogs?.find((blog) => blog._id === id) || null;
  const currentComments = Comments.find(
    (comment) => comment.blogId === currentBlog._id
  );
  console.log(currentBlog);
  // console.log(currentComments?.comments.length);
  const blogWriter = Users.find((user) => user?.email === currentBlog?.email);
  const monthDifference = calculateMonthDifference(currentBlog?.date);
  const [isCommentModal, setIsCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [likeCount, setLikeCount] = useState(currentBlog?.like?.count);

  const [hasLiked, setHasLiked] = useState(
    currentBlog?.like?.email?.includes(user?.email)
  );
  // Update like count and user status on component mount
  useEffect(() => {
    setLikeCount(currentBlog?.like?.count || 0);
    setHasLiked(currentBlog?.like?.email?.includes(user?.email));
  }, [currentBlog]);

  const toggleCommentModal = () => {
    setIsCommentModal(!isCommentModal);
  };
  const [isShareModal, setIsShareModal] = useState(false);
  const toggleShareModal = () => {
    setIsShareModal(!isShareModal);
  };
  const handleLike = async () => {
    if (!user) {
      return toast.error("please Login ");
    }
    try {
      const updatedData = {
        id: currentBlog._id,
        email: user?.email,
      };

      // Optimistically update like count
      if (hasLiked) {
        setLikeCount(likeCount - 1);
        setHasLiked(false);
      } else {
        setLikeCount(likeCount + 1);
        setHasLiked(true);
      }

      // Send request to backend
      const response = await axios.put(
        `https://blogs-editor-server.vercel.app/blogs`,
        updatedData
      );

      if (response.status === 200) {
        toast.success(
          hasLiked ? "Blog unliked successfully" : "Blog liked successfully"
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update like status"
      );
      // Revert state changes if there's an error
      setLikeCount(hasLiked ? likeCount + 1 : likeCount - 1);
      setHasLiked(!hasLiked);
    }
  };

  const handleComment = async (id) => {
    if (!user) {
      return toast.error("please Login ");
    }
    if (comment.trim() === "") {
      toast.error("Please enter a comment before submitting.");
      return;
    }
    const commentData = {
      blogId: id,
      comment: {
        name: user.displayName,
        image: user.photoURL,
        email: user?.email,
        text: comment,
      },
    };
    try {
      const response = await axios.post(
        "https://blogs-editor-server.vercel.app/comments",
        commentData
      );
      if (response.status === 200) {
        toast.success("Comment added successfully!");
      } else {
        toast.error("Failed to add comment.");
      }
    } catch (error) {
      // console.error("Error posting comment:", error);
      toast.error("An error occurred while posting the comment.");
    }

    setComment("");
    setIsCommentModal(false);
  };

  if (isBlogLoading) return <Loader />;

  // Copy link
  const baseUrl = "http://localhost:5173/blogs/details/";

  const handleCopyClick = (id) => {
    const copyUrl = `${baseUrl}${id}`;
    // console.log(copyUrl);
    navigator.clipboard
      .writeText(copyUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy: ", err);
      });
  };
  return (
    <section className="md:px-5 px-2">
      <div className=" border mt-7 rounded pb-12">
        <img
          src={currentBlog?.photo}
          alt={currentBlog?.title}
          className="w-full md:h-[500px] object-fill rounded-t"
        />
        <div className="pt-5 flex items-center justify-between border-b md:px-5 py-2">
          <div className="flex items-center gap-2  px-2">
            <img
              className="h-9 w-9 rounded-full"
              src={blogWriter?.photo}
              alt=""
            />
            <p className="text-sm font-medium">{blogWriter?.name}</p>
          </div>
          <p className="text-sm px-2 text-gray-700">
            {monthDifference === 0
              ? "This month"
              : `${monthDifference} month${monthDifference > 1 ? "s" : ""} ago`}
          </p>
        </div>

        <div className="md:space-y-5 space-y-2 px-5 md:pt-5 pt-2">
          <h2 className="md:text-2xl text-xl font-semibold">
            {currentBlog?.title}
          </h2>
          <p className="text-base font-semibold">
            Category:{" "}
            <span className="text-base font-normal">
              {currentBlog.category}
            </span>
          </p>
          <p dangerouslySetInnerHTML={{ __html: currentBlog?.content }}></p>
        </div>

        <ShowComments id={currentBlog._id} />
        {/*  large devicelike ocmment */}
        <div className="my-4 px-5 hidden md:flex items-center justify-center gap-4">
          {/*  */}

          <button
            onClick={() => handleLike(currentBlog._id)}
            className="flex items-center gap-1"
          >
            <BiSolidLike size={22} /> {likeCount}
          </button>
          <button
            onClick={toggleCommentModal}
            className="flex items-center gap-1"
          >
            <FaComment size={22} /> {currentComments?.comments.length}
          </button>
          <button onClick={toggleShareModal}>
            <BiSolidShareAlt size={25} color="#000" />
          </button>
        </div>
        {/* small device like comment */}

        {(isCommentModal || isShareModal) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setIsCommentModal(false);
              setIsShareModal(false);
            }}
          ></div>
        )}

        {/* Comment Modal */}
        {/* {isCommentModal && (
          <div className="fixed top-1/2 w-[250px] md:w-[250px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white  rounded-lg shadow-lg z-50">
            <h2 className="text-xl font-semibold mb-3  ">Comment</h2>
            <div className="flex flex-col items-end">
              <input
                type="text"
                name=""
                className="outline-none border border-gray-300 px-4 rounded py-2 w-full"
                placeholder="Enter Your Comment"
                id=""
                value={comment} // Bind input value to state
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="mt-2 flex items-center justify-end bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleComment(currentBlog._id)}
              >
                Submit
              </button>
            </div>
          </div>
        )} */}
        {/* Share Modal */}
        {isShareModal && (
          <div className="fixed top-1/2 w-[450px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white  rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-3  ">
                Share Social Media
              </h2>
              <button onClick={toggleShareModal}>
                <FaPlus className="rotate-45" />
              </button>
            </div>
            <div className="flex  items-center justify-center gap-5">
              <RiWhatsappFill color="#25D366" size={35} />
              <FaFacebook color="#316FF6" size={32} />
              <FaLinkedin color="#0077B5" size={30} />
              <button onClick={() => handleCopyClick(currentBlog._id)}>
                <FaCopy size={23} color="#000" />
              </button>
              {/* <FaCopy size={23} color="#000" /> */}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-md fixed left-0  bottom-0  w-full z-20 bg-white md:hidden border py-2 flex items-center justify-center gap-4">
        {/*  */}

        <button
          onClick={() => handleLike(currentBlog._id)}
          className="flex items-center gap-1"
        >
          <BiSolidLike size={22} /> {likeCount}
        </button>
        <button
          onClick={toggleCommentModal}
          className="flex items-center gap-1"
        >
          <FaComment size={22} /> {currentComments?.comments.length}
        </button>
        <button onClick={toggleShareModal}>
          <BiSolidShareAlt size={25} color="#000" />
        </button>
      </div>
      {isCommentModal && (
        <div className="fixed top-1/2 w-[250px] md:w-[450px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg z-50">
          <h2 className="text-xl font-semibold mb-3">Comment</h2>
          <input
            type="text"
            className="outline-none border border-gray-300 px-4 rounded py-2 w-full"
            placeholder="Enter Your Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleComment(currentBlog._id)}
          >
            Submit
          </button>
        </div>
      )}
    </section>
  );
};

export default DetailsBlog;
