import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./router/router.js";
import { Server as SocketServer } from "socket.io";
import http from "http";
const app = express();
app.use(cookieParser());
const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.json());
dotenv.config();

const PORT = process.env.PORT || 3000;
const URL = process.env.URL;

export const io = new SocketServer(server, {
  cors: {
    origin: "http://192.168.1.67:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));

app.use("/uploads", express.static("uploads"));
app.use("/api", router);
