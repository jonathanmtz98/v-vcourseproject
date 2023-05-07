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
      expect(response.render).toHaveBeenCalled();
    });
});


describe("GET /logout", () => {
  it("should logout user and redict", async () => {
    const res = await request(app).get("/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect('Location', '/login');
  });
});

describe("POST /signup", () => {
  it("Should add new user to DB", async () => {
    await request(app)
      .post("/signup")
      .send({name: "Admin_test", 
             password: "admin_test_0000"
             })
      .expect(201);
  });
});


describe("GET /", () => {
  it("should load the home page", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect('Location', '/');
  });
});


describe("POST /edit/:id", () => {
  it("should edit the database correctly", async () => {
    const res = await request(app).post("/edit/44");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(response.render).toHaveBeenCalled();
  });
});


describe("POST /update/:id", () => {
  it("should update the database correctly", async () => {
    const res = await request(app).post("/update/5");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(response.redirect).toHaveBeenCalled();
  });
});


describe("GET manageclientflights", () => {
  it("should rednder the /manageclientflights", async () => {
    const res = await request(app).get("/manageclientflights");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(response.render).toHaveBeenCalled();
  });
});



describe("GET /makepayment", () => {
  it("should render the /makepayment", async () => {
    const res = await request(app).get("/makepayment");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(response.render).toHaveBeenCalled();
  });
});


describe("POST /adminlogin", () => {
  it("should redirct the admin to the /manageflights", async () => {
    await request(app)
      .post("/adminlogin")
      .send({name: "admin", 
             password: "admin"
             })
      .expect(201)
      .expect(response.redirect)
  });
});


describe("POST /deleteDestination/:id", () => {
  it("should delete Destination from the database", async () => {
    const res = await request(app).post("/deleteDestination/5");
    expect(res.statusCode).toBe(200);
    //expect(res.body.length).toBeGreaterThan(0);
    expect(response.redirect).toHaveBeenCalled();
  });
});













