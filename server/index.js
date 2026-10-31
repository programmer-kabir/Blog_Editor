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
    app.patch("/users/admin/:id", async (req, res) => {
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
        res.send({ admin: false });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // User Delete
    app.delete("/users/:email", async (req, res) => {
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
        res.send({ blogger: false });
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
