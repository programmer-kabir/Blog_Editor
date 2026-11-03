const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

//Middleware
app.use(cors());
app.use(express.json());
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized token" });
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized token" });
    }
    req.decoded = decoded;
    next();
  });
};
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0i3pjbq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const blogsCollection = client.db("BlogEditor").collection("blogs");
    const usersCollection = client.db("BlogEditor").collection("users");
    const commentsCollection = client.db("BlogEditor").collection("comments");
    const categoriesCollection = client.db("BlogEditor").collection("categories");
    const bookmarksCollection = client.db("BlogEditor").collection("bookmarks");
    const followsCollection = client.db("BlogEditor").collection("follows");
    const notificationsCollection = client.db("BlogEditor").collection("notifications");
    const draftsCollection = client.db("BlogEditor").collection("drafts");

    // Helper: Dispatch internal notifications
    const createNotification = async ({
      recipientEmail,
      senderEmail = "system",
      senderName = "System",
      senderImage = "",
      type = "system",
      title = "Notification",
      message = "",
      link = "/",
    }) => {
      if (!recipientEmail || recipientEmail === senderEmail) return;
      try {
        await notificationsCollection.insertOne({
          recipientEmail,
          senderEmail,
          senderName,
          senderImage,
          type,
          title,
          message,
          link,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to create notification:", err);
      }
    };

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded?.email;
      if (!email) {
        return res.status(401).send({ error: true, message: "unauthorized" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send({ error: true, message: "forbidden access" });
      }
      next();
    };
    //  jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // User Get
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // Update user to admin
    app.patch("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // console.log(filter);
      // // console.log(filter);
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Get admin
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        return res.send({ admin: false });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // User Delete
    app.delete("/users/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email; // Get the email from the request parameters
      const query = { email: email }; // Create a query object with the email

      try {
        // Check if the user exists
        const existingUser = await usersCollection.findOne(query);
        // console.log("User Found:", existingUser);

        // If user does not exist, return a 404 response
        if (!existingUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Delete the user from the database
        const result = await usersCollection.deleteOne(query);
        // console.log("Deleted Count:", result.deletedCount);

        // Send success response
        if (result.deletedCount > 0) {
          res.status(200).json({ message: "User deleted successfully" });
        } else {
          res.status(500).json({ message: "Failed to delete user" });
        }
      } catch (error) {
        // console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    //  GEt bloger
    app.get("/users/blogger/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        return res.send({ blogger: false });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { blogger: user?.role === "blogger" };
      res.send(result);
    });
    // Blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    // Get single blog by ID
    app.get("/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.send(blog);
      } catch (err) {
        res.status(500).send({ message: "Invalid ID or server error" });
      }
    });

    // Edit blog by ID (blogger)
    app.patch("/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { title, category, tags, content, photo, status } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            title,
            category,
            tags,
            content,
            photo,
            status: status || "pending",
            updatedAt: new Date().toISOString(),
          },
        };
        const result = await blogsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to update blog" });
      }
    });

    app.post("/blogs", async (req, res) => {
      const body = req.body;
      const result = await blogsCollection.insertOne(body);

      // Notify blogger confirmation & notify admins of new submission
      try {
        if (body?.email) {
          await createNotification({
            recipientEmail: body.email,
            type: "system",
            title: "Story Submitted 📝",
            message: `Your story "${body.title?.slice(0, 35)}..." has been submitted for review.`,
            link: "/dashboard/blogger/show-blog",
          });
        }

        // Notify admins
        const admins = await usersCollection.find({ role: "admin" }).toArray();
        for (const admin of admins) {
          if (admin.email && admin.email !== body.email) {
            await createNotification({
              recipientEmail: admin.email,
              senderEmail: body.email || "writer",
              senderName: body.author || "Blogger",
              type: "system",
              title: "New Story Pending Review 🛡️",
              message: `${body.author || "A blogger"} submitted "${body.title?.slice(0, 30)}..." for review.`,
              link: "/dashboard/admin/blogs",
            });
          }
        }
      } catch (err) {
        console.error("Post notification error:", err);
      }

      // Clean up draft after successful submission
      try {
        if (body?.email) {
          await draftsCollection.deleteOne({ email: body.email });
        }
      } catch (de) {}

      res.send(result);
    });
    app.put("/blogs", async (req, res) => {
      const data = req.body;
      // console.log(data);
      if (data?.status === "approved") {
        const filter = { _id: new ObjectId(data.blogId) };
        const updateDoc = {
          $set: { status: data.status },
        };

        const result = await blogsCollection.updateOne(filter, updateDoc);
        try {
          const blog = await blogsCollection.findOne(filter);
          if (blog?.email) {
            await createNotification({
              recipientEmail: blog.email,
              type: "blog_status",
              title: "Story Approved! 🎉",
              message: `Your article "${blog.title?.slice(0, 35)}..." has been published!`,
              link: `/blogs/details/${data.blogId}`,
            });

            // Notify followers of author
            const authorFollowers = await followsCollection.find({ authorEmail: blog.email }).toArray();
            for (const f of authorFollowers) {
              await createNotification({
                recipientEmail: f.followerEmail,
                senderEmail: blog.email,
                senderName: blog.author || "An author you follow",
                senderImage: blog.image || "",
                type: "follow",
                title: "New Story Published 📚",
                message: `${blog.author || "An author you follow"} published: "${blog.title?.slice(0, 35)}..."`,
                link: `/blogs/details/${data.blogId}`,
              });
            }
          }
        } catch (e) {
          console.error("Status notification error:", e);
        }
        res.send(result);
      } else if (data?.status === "reject") {
        const filter = { _id: new ObjectId(data.blogId) };
        const updateDoc = {
          $set: { status: data.status, rejectReason: data.rejectReason },
        };
        const result = await blogsCollection.updateOne(filter, updateDoc);
        try {
          const blog = await blogsCollection.findOne(filter);
          if (blog?.email) {
            await createNotification({
              recipientEmail: blog.email,
              type: "blog_status",
              title: "Story Needs Review ⚠️",
              message: `Your article "${blog.title?.slice(0, 35)}..." was rejected. Reason: ${data.rejectReason || "Quality guidelines"}`,
              link: `/dashboard/blogger/show-blog`,
            });
          }
        } catch (e) {
          console.error("Reject notification error:", e);
        }
        res.send(result);
      } else {
        const filter = { _id: new ObjectId(data.id) };
        const blog = await blogsCollection.findOne(filter);
        const alreadyLiked = blog.like?.email.includes(data.email);

        let updateDoc;
        if (alreadyLiked) {
          // If the user has already liked, unlike it (decrement count, remove email)
          updateDoc = {
            $inc: { "like.count": -1 }, // Decrease the like count
            $pull: { "like.email": data.email }, // Remove the user's email from the array
          };
        } else {
          // If the user hasn't liked it yet, like it (increment count, add email)
          updateDoc = {
            $inc: { "like.count": 1 }, // Increase the like count
            $push: { "like.email": data.email }, // Add the user's email to the array
          };
        }
        const result = await blogsCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    });

    app.get("/bloggersBlog", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const data = await blogsCollection.find(query).toArray();
      res.send(data);
    });

    // Comment
    app.post("/comments", async (req, res) => {
      const { blogId, comment } = req.body;
      try {
        // Check if a document with the same blogId already exists
        const existingBlogComments = await commentsCollection.findOne({
          blogId,
        });

        if (existingBlogComments) {
          // If it exists, update the document by adding the new comment to the array
          const updateDoc = {
            $push: {
              comments: {
                id: new ObjectId(),
                email: comment.email,
                image: comment.image,
                name: comment.name,
                comment: comment.text,
              },
            },
          };

          const result = await commentsCollection.updateOne(
            { blogId },
            updateDoc
          );
          res.send({ message: "Comment added to existing blog", result });
        } else {
          // If it doesn't exist, create a new document
          const newCommentDocument = {
            blogId,
            comments: [
              {
                id: new ObjectId(),
                email: comment.email,
                image: comment.image,
                name: comment.name,
                comment: comment.text,
              },
            ],
          };

          const result = await commentsCollection.insertOne(newCommentDocument);
          res.send({ message: "New comment document created", result });
        }

        // Trigger notification to article author
        try {
          const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
          if (blog?.email) {
            await createNotification({
              recipientEmail: blog.email,
              senderEmail: comment.email,
              senderName: comment.name,
              senderImage: comment.image,
              type: "comment",
              title: "New Comment 💬",
              message: `${comment.name} commented on "${blog.title?.slice(0, 35)}..."`,
              link: `/blogs/details/${blogId}#comments`,
            });
          }
        } catch (ne) {
          console.error("Comment notify error:", ne);
        }
      } catch (error) {
        // console.error("Error adding comment:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.put("/comments", async (req, res) => {
      const { blogId, id, comment } = req.body;
      const commentId = new ObjectId(id);

      try {
        // Check if a document with the given blogId exists
        const existingBlogComments = await commentsCollection.findOne({
          blogId,
        });
        // console.log(existingBlogComments);
        if (existingBlogComments) {
          // Check if the comment with the specified id exists
          const commentExists = existingBlogComments.comments.find((c) =>
            c.id.equals(commentId)
          );
          // console.log(commentExists);
          if (commentExists) {
            // Update the specific comment by matching its id
            const result = await commentsCollection.updateOne(
              { blogId, "comments.id": commentId }, // Match the blogId and the specific comment id
              {
                $set: {
                  "comments.$.comment": comment,
                },
              }
            );

            if (result.modifiedCount > 0) {
              res.send({ message: "Comment updated successfully", result });
            } else {
              res.status(404).send({ message: "Comment not found" });
            }
          } else {
            res.status(404).send({ message: "Comment ID not found" });
          }
        } else {
          res.status(404).send({ message: "Blog ID not found" });
        }
      } catch (error) {
        // console.error("Error updating comment:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
//     app.delete("/comments", async (req, res) => {
//       const { blogId, id } = req.body; // Get blogId and comment id from request body
// console.log(blogId,id);
//       try {
//         // Delete the specific comment from the comments array using $pull
//         const result = await commentsCollection.updateOne(
//           { blogId }, // Find the document with the matching blogId
//           {
//             $pull: {
//               comments: { id: id }, // Remove the comment that matches this id
//             },
//           }
//         );

//         if (result.modifiedCount > 0) {
//           res.send({ message: "Comment deleted successfully", result });
//         } else {
//           res.status(404).send({ message: "Comment or Blog ID not found" });
//         }
//       } catch (error) {
//         console.error("Error deleting comment:", error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     });

app.delete("/comments", async (req, res) => {
  const { blogId, id } = req.body; // Get blogId and comment id from request body
  // console.log("Blog ID:", blogId, "Comment ID:", id);

  try {
    // Convert the comment id to ObjectId
    const commentObjectId = new ObjectId(id);

    // Delete the specific comment from the comments array using $pull
    const result = await commentsCollection.updateOne(
      { blogId }, // Find the document with the matching blogId
      {
        $pull: {
          comments: { id: commentObjectId }, // Remove the comment that matches this ObjectId
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.send({ message: "Comment deleted successfully", result });
    } else {
      res.status(404).send({ message: "Comment or Blog ID not found" });
    }
  } catch (error) {
    // console.error("Error deleting comment:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
    app.get("/comments", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.send(result);
    });
    // Dynamic Categories APIs
    const initialCategories = [
      { title: "programming", label: "Programming & Code", icon: "💻", image: "https://i.ibb.co/mGLLb3J/programming.png" },
      { title: "technology", label: "Technology & Gadgets", icon: "⚡", image: "https://i.ibb.co/RgGYFZX/technology.png" },
      { title: "devops", label: "Cloud & DevOps", icon: "☁️", image: "https://i.ibb.co/W2gcY2f/devops.png" },
      { title: "travel", label: "Travel & Tours", icon: "✈️", image: "https://i.ibb.co/ch45DSX/airplane.png" },
      { title: "education", label: "Education & Learning", icon: "🎓", image: "https://i.ibb.co/zxLhYWh/education.png" },
      { title: "lifestyle", label: "Lifestyle & Culture", icon: "🌿", image: "https://i.ibb.co/QjXbcds/lifestyle.png" },
      { title: "fitness", label: "Health & Fitness", icon: "💪", image: "https://i.ibb.co/4Pszfzw/fitness.png" },
      { title: "fashion", label: "Fashion & Style", icon: "👗", image: "https://i.ibb.co/VJ7cnjw/dress.png" },
      { title: "food", label: "Food & Culinary", icon: "🍔", image: "https://i.ibb.co/g7MCw38/food.png" },
    ];

    try {
      const catCount = await categoriesCollection.countDocuments();
      if (catCount === 0) {
        await categoriesCollection.insertMany(initialCategories);
      }
    } catch (e) {
      console.error("Categories initial seed error:", e);
    }

    // GET all categories
    app.get("/categories", async (req, res) => {
      try {
        const result = await categoriesCollection.find().toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch categories" });
      }
    });

    // POST new category (Admin only)
    app.post("/categories", verifyJWT, verifyAdmin, async (req, res) => {
      const category = req.body;
      if (!category.title || !category.label) {
        return res.status(400).send({ message: "Category title and label are required" });
      }

      const slug = category.title.toLowerCase().trim().replace(/\s+/g, "-");
      const existing = await categoriesCollection.findOne({ title: slug });
      if (existing) {
        return res.status(400).send({ message: "Category with this slug already exists" });
      }

      const newCategory = {
        title: slug,
        label: category.label.trim(),
        icon: category.icon?.trim() || "📌",
        image: category.image?.trim() || "https://i.ibb.co/mGLLb3J/programming.png",
        createdAt: new Date().toISOString(),
      };

      const result = await categoriesCollection.insertOne(newCategory);
      res.send({ insertedId: result.insertedId, message: "Category created successfully", category: newCategory });
    });

    // DELETE category (Admin only)
    app.delete("/categories/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await categoriesCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.send({ message: "Category deleted successfully", deletedCount: 1 });
        } else {
          res.status(404).send({ message: "Category not found" });
        }
      } catch (err) {
        res.status(500).send({ message: "Error deleting category" });
      }
    });

    // Bookmarks Endpoints
    // 1. Get all bookmarked blogs for a user
    app.get("/bookmarks", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email query param is required" });
      }
      try {
        const userBookmarks = await bookmarksCollection.find({ email }).toArray();
        if (userBookmarks.length === 0) {
          return res.send([]);
        }
        const blogIds = userBookmarks.map((b) => new ObjectId(b.blogId));
        const bookmarkedBlogs = await blogsCollection.find({ _id: { $in: blogIds } }).toArray();
        res.send(bookmarkedBlogs);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        res.status(500).send({ message: "Failed to fetch bookmarks" });
      }
    });

    // 2. Get list of bookmarked blogIds for instant status check
    app.get("/bookmarks/ids", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
      try {
        const userBookmarks = await bookmarksCollection.find({ email }).toArray();
        const ids = userBookmarks.map((b) => b.blogId);
        res.send(ids);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch bookmark IDs" });
      }
    });

    // 3. Toggle bookmark (add if not exists, remove if exists)
    app.post("/bookmarks/toggle", async (req, res) => {
      const { email, blogId } = req.body;
      if (!email || !blogId) {
        return res.status(400).send({ message: "Email and blogId are required" });
      }
      try {
        const existing = await bookmarksCollection.findOne({ email, blogId });
        if (existing) {
          await bookmarksCollection.deleteOne({ _id: existing._id });
          return res.send({ bookmarked: false, message: "Removed from bookmarks" });
        } else {
          const newBookmark = {
            email,
            blogId,
            createdAt: new Date().toISOString(),
          };
          await bookmarksCollection.insertOne(newBookmark);
          return res.send({ bookmarked: true, message: "Added to reading list" });
        }
      } catch (err) {
        console.error("Error toggling bookmark:", err);
        res.status(500).send({ message: "Failed to toggle bookmark" });
      }
    });

    // ==========================================
    // 1. Threaded Replies in Comments
    // ==========================================
    app.post("/comments/reply", async (req, res) => {
      const { blogId, commentId, reply } = req.body;
      if (!blogId || !commentId || !reply?.text) {
        return res.status(400).send({ message: "blogId, commentId, and reply are required" });
      }

      try {
        const replyObj = {
          id: new ObjectId(),
          email: reply.email,
          name: reply.name,
          image: reply.image,
          text: reply.text,
          createdAt: new Date().toISOString(),
        };

        const targetCommentId = new ObjectId(commentId);
        const result = await commentsCollection.updateOne(
          { blogId, "comments.id": targetCommentId },
          {
            $push: {
              "comments.$.replies": replyObj,
            },
          }
        );

        if (result.modifiedCount > 0) {
          // Trigger notification to original comment author
          try {
            const blogDoc = await commentsCollection.findOne({ blogId });
            const targetComment = blogDoc?.comments?.find((c) => c.id.equals(targetCommentId));
            const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });

            if (targetComment?.email) {
              await createNotification({
                recipientEmail: targetComment.email,
                senderEmail: reply.email,
                senderName: reply.name,
                senderImage: reply.image,
                type: "reply",
                title: "New Reply ↩️",
                message: `${reply.name} replied to your comment on "${blog?.title?.slice(0, 35) || "Story"}..."`,
                link: `/blogs/details/${blogId}#comments`,
              });
            }
          } catch (ne) {
            console.error("Reply notify error:", ne);
          }

          res.send({ message: "Reply added successfully", reply: replyObj });
        } else {
          res.status(404).send({ message: "Comment not found" });
        }
      } catch (err) {
        console.error("Error adding reply:", err);
        res.status(500).send({ message: "Failed to add reply" });
      }
    });

    app.delete("/comments/reply", async (req, res) => {
      const { blogId, commentId, replyId } = req.body;
      try {
        const targetCommentId = new ObjectId(commentId);
        const targetReplyId = new ObjectId(replyId);

        const result = await commentsCollection.updateOne(
          { blogId, "comments.id": targetCommentId },
          {
            $pull: {
              "comments.$.replies": { id: targetReplyId },
            },
          }
        );
        res.send({ message: "Reply deleted", result });
      } catch (err) {
        res.status(500).send({ message: "Failed to delete reply" });
      }
    });

    // ==========================================
    // 2. Claps & Multi-Emoji Reactions System
    // ==========================================
    app.post("/blogs/react", async (req, res) => {
      const { blogId, email, reactionType, count = 1, userName, userImage } = req.body;
      if (!blogId || !reactionType) {
        return res.status(400).send({ message: "blogId and reactionType required" });
      }

      const validReactions = ["claps", "love", "insightful", "mindblown"];
      if (!validReactions.includes(reactionType)) {
        return res.status(400).send({ message: "Invalid reaction type" });
      }

      try {
        const filter = { _id: new ObjectId(blogId) };
        const blog = await blogsCollection.findOne(filter);
        if (!blog) return res.status(404).send({ message: "Blog not found" });

        const currentReactions = blog.reactions || { claps: 0, love: 0, insightful: 0, mindblown: 0 };
        const userReactionsMap = blog.userReactions || {};
        const currentUserReacts = (email && userReactionsMap[email]) || {
          claps: 0,
          love: false,
          insightful: false,
          mindblown: false,
        };

        let reactionDiff = 0;

        if (reactionType === "claps") {
          // Allow clapping up to 50 times per user
          const currentClaps = currentUserReacts.claps || 0;
          const increment = Math.min(Math.max(1, parseInt(count) || 1), 50 - currentClaps);
          if (increment > 0) {
            currentUserReacts.claps = currentClaps + increment;
            currentReactions.claps = (currentReactions.claps || 0) + increment;
            reactionDiff = increment;
          }
        } else {
          // Toggle reaction
          const isCurrentlyReacted = !!currentUserReacts[reactionType];
          if (isCurrentlyReacted) {
            currentUserReacts[reactionType] = false;
            currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] || 1) - 1);
            reactionDiff = -1;
          } else {
            currentUserReacts[reactionType] = true;
            currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
            reactionDiff = 1;
          }
        }

        if (email) {
          userReactionsMap[email] = currentUserReacts;
        }

        await blogsCollection.updateOne(filter, {
          $set: {
            reactions: currentReactions,
            userReactions: userReactionsMap,
          },
        });

        // Notify author on new reaction
        if (reactionDiff > 0 && email && blog.email !== email) {
          const reactionIcons = { claps: "👏", love: "❤️", insightful: "💡", mindblown: "🚀" };
          await createNotification({
            recipientEmail: blog.email,
            senderEmail: email,
            senderName: userName || "A reader",
            senderImage: userImage || "",
            type: "reaction",
            title: `Story Reaction ${reactionIcons[reactionType] || "👏"}`,
            message: `${userName || "A reader"} reacted (${reactionType}) to "${blog.title?.slice(0, 35)}..."`,
            link: `/blogs/details/${blogId}`,
          });
        }

        res.send({
          reactions: currentReactions,
          userReaction: currentUserReacts,
        });
      } catch (err) {
        console.error("Reaction error:", err);
        res.status(500).send({ message: "Failed to record reaction" });
      }
    });

    app.get("/blogs/:id/reactions", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      try {
        const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
        if (!blog) return res.status(404).send({ message: "Blog not found" });

        const reactions = blog.reactions || { claps: 0, love: 0, insightful: 0, mindblown: 0 };
        const userReaction = (email && blog.userReactions?.[email]) || {
          claps: 0,
          love: false,
          insightful: false,
          mindblown: false,
        };

        res.send({ reactions, userReaction });
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch reactions" });
      }
    });

    // ==========================================
    // 3. Author Public Profile & Follow System
    // ==========================================
    app.get("/authors/profile/:email", async (req, res) => {
      const email = req.params.email;
      const currentViewerEmail = req.query.viewerEmail;

      try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).send({ message: "Author not found" });
        }

        const authorBlogs = await blogsCollection
          .find({ email, status: "approved" })
          .sort({ _id: -1 })
          .toArray();

        const followersCount = await followsCollection.countDocuments({ authorEmail: email });
        const followingCount = await followsCollection.countDocuments({ followerEmail: email });

        let isFollowing = false;
        if (currentViewerEmail) {
          const followDoc = await followsCollection.findOne({
            authorEmail: email,
            followerEmail: currentViewerEmail,
          });
          isFollowing = !!followDoc;
        }

        let totalReactions = 0;
        authorBlogs.forEach((b) => {
          totalReactions += b.like?.count || 0;
          if (b.reactions) {
            totalReactions +=
              (b.reactions.claps || 0) +
              (b.reactions.love || 0) +
              (b.reactions.insightful || 0) +
              (b.reactions.mindblown || 0);
          }
        });

        res.send({
          author: {
            _id: user._id,
            name: user.name,
            email: user.email,
            photoURL: user.photoURL || user.photo || "",
            role: user.role,
            bio: user.bio || "Passionate content creator & writer on Blog Editor.",
            coverImage:
              user.coverImage ||
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80",
            socialLinks: user.socialLinks || {
              github: "",
              linkedin: "",
              twitter: "",
              website: "",
            },
            joinedAt: user.createdAt || null,
          },
          stats: {
            blogsCount: authorBlogs.length,
            followersCount,
            followingCount,
            totalReactions,
          },
          blogs: authorBlogs,
          isFollowing,
        });
      } catch (err) {
        console.error("Author profile error:", err);
        res.status(500).send({ message: "Failed to load author profile" });
      }
    });

    app.put("/authors/profile", async (req, res) => {
      const { email, bio, coverImage, socialLinks, name, photoURL } = req.body;
      if (!email) return res.status(400).send({ message: "Email required" });

      try {
        const updateFields = {};
        if (bio !== undefined) updateFields.bio = bio;
        if (coverImage !== undefined) updateFields.coverImage = coverImage;
        if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;
        if (name !== undefined) updateFields.name = name;
        if (photoURL !== undefined) updateFields.photoURL = photoURL;

        const result = await usersCollection.updateOne({ email }, { $set: updateFields });
        res.send({ message: "Profile updated successfully", result });
      } catch (err) {
        res.status(500).send({ message: "Failed to update profile" });
      }
    });

    app.post("/authors/follow", async (req, res) => {
      const { followerEmail, authorEmail, followerName, followerImage } = req.body;
      if (!followerEmail || !authorEmail) {
        return res.status(400).send({ message: "followerEmail and authorEmail are required" });
      }
      if (followerEmail === authorEmail) {
        return res.status(400).send({ message: "You cannot follow yourself" });
      }

      try {
        const existing = await followsCollection.findOne({ followerEmail, authorEmail });
        if (existing) {
          await followsCollection.deleteOne({ _id: existing._id });
          const followersCount = await followsCollection.countDocuments({ authorEmail });
          return res.send({ isFollowing: false, followersCount, message: "Unfollowed successfully" });
        } else {
          await followsCollection.insertOne({
            followerEmail,
            authorEmail,
            createdAt: new Date().toISOString(),
          });
          const followersCount = await followsCollection.countDocuments({ authorEmail });

          await createNotification({
            recipientEmail: authorEmail,
            senderEmail: followerEmail,
            senderName: followerName || "A reader",
            senderImage: followerImage || "",
            type: "follow",
            title: "New Follower! 👤",
            message: `${followerName || "A reader"} started following you!`,
            link: `/author/${followerEmail}`,
          });

          return res.send({ isFollowing: true, followersCount, message: "Following successfully" });
        }
      } catch (err) {
        console.error("Follow toggle error:", err);
        res.status(500).send({ message: "Failed to toggle follow" });
      }
    });

    // ==========================================
    // 4. Notification Center APIs
    // ==========================================
    app.get("/notifications", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.send([]);
      try {
        const notifs = await notificationsCollection
          .find({ recipientEmail: email })
          .sort({ createdAt: -1 })
          .limit(40)
          .toArray();
        res.send(notifs);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch notifications" });
      }
    });

    app.get("/notifications/unread-count", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.send({ count: 0 });
      try {
        const count = await notificationsCollection.countDocuments({
          recipientEmail: email,
          read: false,
        });
        res.send({ count });
      } catch (err) {
        res.status(500).send({ message: "Failed to get unread count" });
      }
    });

    app.put("/notifications/read", async (req, res) => {
      const { id, email, all } = req.body;
      try {
        if (all && email) {
          await notificationsCollection.updateMany(
            { recipientEmail: email, read: false },
            { $set: { read: true } }
          );
          return res.send({ message: "All notifications marked as read" });
        } else if (id) {
          await notificationsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true } }
          );
          return res.send({ message: "Notification marked as read" });
        }
        res.status(400).send({ message: "id or (all and email) required" });
      } catch (err) {
        res.status(500).send({ message: "Failed to update notification" });
      }
    });

    app.delete("/notifications", async (req, res) => {
      const { id, email, all } = req.body;
      try {
        if (all && email) {
          await notificationsCollection.deleteMany({ recipientEmail: email });
          return res.send({ message: "All notifications deleted" });
        } else if (id) {
          await notificationsCollection.deleteOne({ _id: new ObjectId(id) });
          return res.send({ message: "Notification deleted" });
        }
        res.status(400).send({ message: "id or (all and email) required" });
      } catch (err) {
        res.status(500).send({ message: "Failed to delete notification" });
      }
    });

    // ==========================================
    // 5. Auto-Save Drafts Engine
    // ==========================================
    app.get("/drafts", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.send({ draft: null });
      try {
        const draft = await draftsCollection.findOne({ email });
        res.send({ draft });
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch draft" });
      }
    });

    app.put("/drafts", async (req, res) => {
      const { email, title, category, tags, content, previewImage } = req.body;
      if (!email) return res.status(400).send({ message: "Author email required" });
      try {
        const updateData = {
          email,
          title: title || "",
          category: category || null,
          tags: Array.isArray(tags) ? tags : [],
          content: content || "",
          previewImage: previewImage || null,
          updatedAt: new Date().toISOString(),
        };

        const result = await draftsCollection.updateOne(
          { email },
          { $set: updateData },
          { upsert: true }
        );

        res.send({ message: "Draft saved successfully", draft: updateData, result });
      } catch (err) {
        console.error("Draft save error:", err);
        res.status(500).send({ message: "Failed to save draft" });
      }
    });

    app.delete("/drafts", async (req, res) => {
      const email = req.query.email || req.body?.email;
      if (!email) return res.status(400).send({ message: "Author email required" });
      try {
        await draftsCollection.deleteOne({ email });
        res.send({ message: "Draft cleared successfully" });
      } catch (err) {
        res.status(500).send({ message: "Failed to delete draft" });
      }
    });

    // ==========================================
    // 6. Smart Views Counter & Analytics
    // ==========================================
    app.post("/blogs/:id/view", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid blog ID" });
      }

      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const filter = { _id: new ObjectId(id) };

        const result = await blogsCollection.findOneAndUpdate(
          filter,
          {
            $inc: {
              views: 1,
              [`dailyViews.${today}`]: 1,
            },
          },
          { returnDocument: "after" }
        );

        const updatedBlog = result?.value || result;
        res.send({
          success: true,
          views: updatedBlog?.views || 1,
        });
      } catch (err) {
        console.error("View increment error:", err);
        res.status(500).send({ message: "Failed to increment view count" });
      }
    });

    app.get("/blogger/analytics/:email", async (req, res) => {
      const email = req.params.email;
      if (!email) return res.status(400).send({ message: "Blogger email required" });

      try {
        const authorBlogs = await blogsCollection.find({ email }).toArray();

        let totalViews = 0;
        let totalLikes = 0;
        let totalReactions = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let rejectCount = 0;

        authorBlogs.forEach((b) => {
          totalViews += b.views || 0;
          totalLikes += b.like?.count || 0;
          if (b.status === "approved") approvedCount++;
          else if (b.status === "pending") pendingCount++;
          else if (b.status === "reject") rejectCount++;

          if (b.reactions) {
            totalReactions +=
              (b.reactions.claps || 0) +
              (b.reactions.love || 0) +
              (b.reactions.insightful || 0) +
              (b.reactions.mindblown || 0);
          }
        });

        // 7-day views trend aggregation
        const viewsOverTime = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

          let dayViews = 0;
          authorBlogs.forEach((b) => {
            if (b.dailyViews && b.dailyViews[dateStr]) {
              dayViews += b.dailyViews[dateStr];
            }
          });

          viewsOverTime.push({
            date: dateStr,
            day: dayName,
            views: dayViews,
          });
        }

        // Top 5 Performing Stories
        const topStories = [...authorBlogs]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((b) => ({
            _id: b._id,
            title: b.title,
            views: b.views || 0,
            likes: b.like?.count || 0,
            claps: b.reactions?.claps || 0,
            status: b.status,
            category: b.category,
          }));

        // Engagement calculation (normalized percentage)
        const engagementRate =
          totalViews > 0
            ? Math.min(100, Number((((totalLikes + totalReactions) / (totalViews + totalLikes + 10)) * 100).toFixed(1)))
            : 0;

        res.send({
          stats: {
            totalSubmissions: authorBlogs.length,
            approvedCount,
            pendingCount,
            rejectCount,
            totalViews,
            totalLikes,
            totalReactions,
            engagementRate,
          },
          viewsOverTime,
          topStories,
        });
      } catch (err) {
        console.error("Blogger analytics error:", err);
        res.status(500).send({ message: "Failed to load blogger analytics" });
      }
    });

    // ==========================================
    // 7. Series & Collections Engine
    // ==========================================
    app.get("/series", async (req, res) => {
      try {
        const seriesDocs = await blogsCollection
          .aggregate([
            { $match: { "series.name": { $exists: true, $ne: null, $ne: "" } } },
            {
              $group: {
                _id: "$series.name",
                totalParts: { $sum: 1 },
                author: { $first: "$author" },
                authorEmail: { $first: "$email" },
                coverImage: { $first: "$photo" },
                latestDate: { $max: "$date" },
              },
            },
            { $sort: { latestDate: -1 } },
          ])
          .toArray();

        res.send(
          seriesDocs.map((s) => ({
            name: s._id,
            totalParts: s.totalParts,
            author: s.author,
            authorEmail: s.authorEmail,
            coverImage: s.coverImage,
            latestDate: s.latestDate,
          }))
        );
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch series list" });
      }
    });

    app.get("/series/:name", async (req, res) => {
      const name = decodeURIComponent(req.params.name);
      try {
        const seriesBlogs = await blogsCollection
          .find({ "series.name": name })
          .sort({ "series.part": 1 })
          .toArray();

        if (seriesBlogs.length === 0) {
          return res.status(404).send({ message: "Series not found" });
        }

        res.send({
          name,
          totalParts: seriesBlogs.length,
          author: seriesBlogs[0]?.author,
          authorEmail: seriesBlogs[0]?.email,
          blogs: seriesBlogs.map((b) => ({
            _id: b._id,
            title: b.title,
            part: b.series?.part || 1,
            category: b.category,
            date: b.date,
            photo: b.photo,
            views: b.views || 0,
          })),
        });
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch series details" });
      }
    });

    // Helper: Escape HTML characters for Open Graph meta tags
    const escapeHtml = (str = "") =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Dynamic Open Graph & Social Preview Endpoint
    // When shared to Facebook, Twitter, WhatsApp, Telegram, etc., returns genuine server-rendered HTML
    app.get("/share/blog/:id", async (req, res) => {
      try {
        const { id } = req.params;
        let query = {};
        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }
        const blog = await blogsCollection.findOne(query);
        if (!blog) {
          return res.redirect("http://localhost:5180/blogs");
        }

        const plainExcerpt = (blog.content || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160);

        const clientAppUrl = `http://localhost:5180/blogs/details/${blog._id}`;
        const coverImage =
          blog.photo ||
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&h=630&q=85";

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(blog.title)} | Blog Editor</title>
  <meta name="description" content="${escapeHtml(plainExcerpt)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Blog Editor">
  <meta property="og:title" content="${escapeHtml(blog.title)}">
  <meta property="og:description" content="${escapeHtml(plainExcerpt)}">
  <meta property="og:image" content="${escapeHtml(coverImage)}">
  <meta property="og:url" content="${clientAppUrl}">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(blog.title)}">
  <meta name="twitter:description" content="${escapeHtml(plainExcerpt)}">
  <meta name="twitter:image" content="${escapeHtml(coverImage)}">

  <!-- Immediate Redirect to Client App for Readers -->
  <script>window.location.href = "${clientAppUrl}";</script>
  <meta http-equiv="refresh" content="0; url=${clientAppUrl}">
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; color: #334155;">
  <h2>Redirecting to article...</h2>
  <p><a href="${clientAppUrl}" style="color: #F50400; font-weight: bold;">${escapeHtml(blog.title)}</a></p>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
      } catch (err) {
        console.error("Open Graph render error:", err);
        res.status(500).send("Error generating social preview");
      }
    });

    // Helper: Server-side slug generator for XML feeds
    const slugifyServer = (text = "") => {
      if (!text || typeof text !== "string") return "";
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/[^\p{L}\p{N}-]+/gu, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    // Helper: Escape XML entities
    const escapeXml = (str = "") =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    // Helper: Clean plain-text excerpt for XML descriptions
    const cleanExcerptXml = (html = "", maxLength = 280) => {
      if (!html) return "";
      const plain = html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (plain.length <= maxLength) return plain;
      return plain.slice(0, maxLength).trim() + "...";
    };

    // 1. Dynamic XML Sitemap Generator (Google & Search Engine standard)
    app.get("/sitemap.xml", async (req, res) => {
      try {
        const baseUrl = process.env.CLIENT_URL || "http://localhost:5180";
        const today = new Date().toISOString().split("T")[0];

        // Static core routes
        const staticRoutes = [
          { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
          { loc: `${baseUrl}/blogs`, priority: "0.9", changefreq: "daily" },
          { loc: `${baseUrl}/about-us`, priority: "0.5", changefreq: "monthly" },
          { loc: `${baseUrl}/contact-us`, priority: "0.5", changefreq: "monthly" },
          { loc: `${baseUrl}/faqs`, priority: "0.6", changefreq: "monthly" },
          { loc: `${baseUrl}/trems-conditions`, priority: "0.3", changefreq: "yearly" },
        ];

        // Query all blogs from MongoDB
        const blogs = await blogsCollection.find({}).sort({ _id: -1 }).toArray();

        const categoriesSet = new Set();
        const tagsSet = new Set();
        const authorsSet = new Set();

        const blogRoutes = blogs.map((b) => {
          if (b.category) categoriesSet.add(b.category);
          if (b.email) authorsSet.add(b.email);
          if (Array.isArray(b.tags)) {
            b.tags.forEach((t) => tagsSet.add(t));
          }

          const slug = slugifyServer(b.title);
          const loc = slug
            ? `${baseUrl}/blogs/details/${b._id}/${slug}`
            : `${baseUrl}/blogs/details/${b._id}`;

          const lastmod =
            b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : today;

          return {
            loc,
            lastmod,
            changefreq: "weekly",
            priority: "0.8",
          };
        });

        const categoryRoutes = Array.from(categoriesSet).map((cat) => ({
          loc: `${baseUrl}/blogs/category/${encodeURIComponent(cat)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: "0.7",
        }));

        const tagRoutes = Array.from(tagsSet).map((tag) => ({
          loc: `${baseUrl}/blogs/tag/${encodeURIComponent(tag)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: "0.6",
        }));

        const authorRoutes = Array.from(authorsSet).map((email) => ({
          loc: `${baseUrl}/author/${encodeURIComponent(email)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: "0.7",
        }));

        const allUrls = [
          ...staticRoutes,
          ...blogRoutes,
          ...categoryRoutes,
          ...tagRoutes,
          ...authorRoutes,
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq || "weekly"}</changefreq>
    <priority>${u.priority || "0.5"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(xml);
      } catch (err) {
        console.error("Sitemap generation error:", err);
        res.status(500).send("Error generating sitemap");
      }
    });

    // 2. RSS 2.0 & Atom Feed Generator
    app.get(["/rss.xml", "/feed.xml"], async (req, res) => {
      try {
        const baseUrl = process.env.CLIENT_URL || "http://localhost:5180";
        const serverUrl = `http://localhost:${port}`;
        const buildDate = new Date().toUTCString();

        // Query latest blogs
        const blogs = await blogsCollection
          .find({})
          .sort({ _id: -1 })
          .limit(30)
          .toArray();

        const users = await usersCollection.find({}).toArray();
        const userMap = new Map(
          users.map((u) => [u.email, u.name || "Editorial Writer"])
        );

        const itemsXml = blogs
          .map((b) => {
            const slug = slugifyServer(b.title);
            const articleUrl = slug
              ? `${baseUrl}/blogs/details/${b._id}/${slug}`
              : `${baseUrl}/blogs/details/${b._id}`;
            const pubDate = b.date
              ? new Date(b.date).toUTCString()
              : buildDate;
            const authorName = userMap.get(b.email) || "Editorial Writer";
            const excerpt = cleanExcerptXml(b.content, 350);

            return `    <item>
      <title>${escapeXml(b.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${baseUrl}/blogs/details/${b._id}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${authorName}]]></dc:creator>
      <category><![CDATA[${b.category || "General"}]]></category>
      <description><![CDATA[${excerpt}]]></description>
      ${
        b.photo
          ? `<enclosure url="${escapeXml(
              b.photo
            )}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
          })
          .join("\n");

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Blog Editor - Engineering, Tech &amp; Tutorials</title>
    <link>${baseUrl}</link>
    <description>Discover high-impact articles, engineering guides, and deep-dive technical tutorials curated for modern developers and creators.</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${serverUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=1800");
        res.send(rssXml);
      } catch (err) {
        console.error("RSS generation error:", err);
        res.status(500).send("Error generating RSS feed");
      }
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Ok!");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
