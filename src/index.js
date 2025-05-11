import "dotenv/config";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import { Server } from "socket.io";
import { connectToDb } from "./config/db.js";
import "./config/passport.js";
import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";

const CLIENT_URL = process.env.CLIENT_URL;
if (!CLIENT_URL) {
  console.warn("WARNING: Please set client url on your .env!");
}

const PORT = process.env.PORT || 5555;
if (!PORT) {
  console.warn(
    "WARNING: No port define on .env, it will default to port 5555!"
  );
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, credentials: true },
});

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

connectToDb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error}`);
    process.exit(1);
  });
