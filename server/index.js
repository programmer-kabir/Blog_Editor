const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const app = express();
const port = 3000;
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

    app.post("/blogs", async (req, res) => {
      const body = req.body;
      const result = await blogsCollection.insertOne(body);
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
        res.send(result);
      } else if (data?.status === "reject") {
        const filter = { _id: new ObjectId(data.blogId) };
        const updateDoc = {
          $set: { status: data.status, rejectReason: data.rejectReason },
        };
        const result = await blogsCollection.updateOne(filter, updateDoc);
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

app.listen(port, () => {});
