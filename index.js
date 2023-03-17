import express from "express";
import {MongoClient} from "mongosh";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT = 8080;