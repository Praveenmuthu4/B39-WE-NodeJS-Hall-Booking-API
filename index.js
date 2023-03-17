import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

export const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Mongo is connected ");

app.use(express.json());

app.get("/", function (req, res) {
  res.send("Welcome to New Hall Booking");
});

app.get("/findRoom", async function (req, res) {
  const result = await client
    .db("HallBooking")
    .collection("room")
    .find({})
    .toArray();

  result ? res.send(result) : res.status(404).send("Room not Found");
});

app.post("/createRoom", async function (req, res) {
  const data = req.body;
  console.log(data);
  const result = await client
    .db("HallBooking")
    .collection("room")
    .insertMany(data);
  res.send(result);
});

app.get("/availableRoom", async function (req, res) {
  const result = await client
    .db("HallBooking")
    .collection("room")
    .find({ Booked: "False" })
    .toArray();

  result ? res.send(result) : res.status(404).send("Empty Room not Found");
});

app.post("/bookRoom", async function (req, res) {
  const Data = req.body;
  const date = new Date().toString();
  const bookStatus = { Booked: "True" };

  var AvailableRoom = await client
    .db("HallBooking")
    .collection("room")
    .findOne({ Booked: "False" });

  if (AvailableRoom === null) {
    res.send({ Message: "No Rooms Available!! create a room!!" });
  }
  const updateData = { RoomId: AvailableRoom.id, date: date };
  var result = await client
    .db("HallBooking")
    .collection("bookedRoom")
    .insertOne(Data);

  result = await client
    .db("HallBooking")
    .collection("bookedRoom")
    .updateOne({ RoomId: "" }, { $set: updateData });

  AvailableRoom = await client
    .db("HallBooking")
    .collection("room")
    .updateOne({ id: AvailableRoom.id }, { $set: bookStatus });

  res.send(result);
});

app.put("/vacateRoom/:id", async function (req, res) {
  const { id } = req.params;
  const bookStatus = { Booked: "False" };

  const result = await client
    .db("HallBooking")
    .collection("bookedRoom")
    .deleteOne({ RoomId: parseInt(id) });
  if (result.deletedCount > 0) {
    await client
      .db("HallBooking")
      .collection("room")
      .updateOne({ id: parseInt(id) }, { $set: bookStatus });
  }
  result.deletedCount > 0
    ? res.send(result)
    : res.status(404).send("Room already free and it can be used");
});

app.get("/bookedRooms", async function (req, resp) {
  const result = await client
    .db("HallBooking")
    .collection("bookedRoom")
    .find({})
    .toArray();

  result ? resp.send(result) : resp.status(404).send("No rooms are booked!!");
});

app.get("/bookedRooms/:id", async function (req, resp) {
  const { id } = req.params;
  const result = await client
    .db("HallBooking")
    .collection("bookedRoom")
    .find({ customerName: id })
    .toArray();

  result ? resp.send(result) : resp.status(404).send("No rooms are booked!!");
});

app.put("/updateFacilities/:id", async function (req, resp) {
  const { id } = req.params;
  const facilities = req.body;
  console.log(id, facilities);
  const result = await client
    .db("HallBooking")
    .collection("Room")
    .updateOne({ id: parseInt(id) }, { $set: facilities });

  resp.send(result);
});

app.listen(PORT, () => console.log(`The server started in: ${PORT}`));
