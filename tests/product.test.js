const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  
  /* Closing database connection after each test. */
  afterEach(async () => {
    await mongoose.connection.close();
  });



describe("GET /viewflights", () => {
    it("should return all flihgts", async () => {
      const res = await request(app).get("/viewflights");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});