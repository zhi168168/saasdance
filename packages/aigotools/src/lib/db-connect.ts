import mongoose, { ConnectOptions } from "mongoose";

import { ensureSiteIndexes } from "../models/site";

import { AppConfig } from "@/lib/config";
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!AppConfig.mongoUri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
    };

    const connection = mongoose
      .connect(AppConfig.mongoUri!, opts)
      .then(async (mongoose) => {
        // after mongo collect
        await ensureSiteIndexes();

        return mongoose;
      });

    cached.promise = connection;
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  // 添加事件监听器
  mongoose.connection.on("connected", () => {
    global.console.log("Mongoose connection established.");
  });

  mongoose.connection.on("error", (err) => {
    global.console.error("Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    global.console.log("Mongoose connection disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    global.console.log("Mongoose connection reconnected.");
  });

  mongoose.connection.on("reconnectFailed", () => {
    global.console.error("Mongoose reconnection failed.");
  });

  return cached.conn;
}

export default dbConnect;
