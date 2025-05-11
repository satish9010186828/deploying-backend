const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

let db;
const app = express();
app.use(express.json());
app.use(cors());

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "applicants.db"),
      driver: sqlite3.Database,
    });

    const server = app.listen(4000, () => {
      console.log("Server is running on http://localhost:4000/");
    });

    // Export only if needed for testing
    // module.exports = server;
  } catch (error) {
    console.log(`Database error is ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();


// GET all applicants
app.get("/api/applicants", async (request, response) => {
  const getDataQuery = `SELECT * FROM applicants3;`;
  const applicantData = await db.all(getDataQuery);
  response.send(applicantData);
});

// POST new applicant
app.post("/api/applicants", async (request, response) => {
  try {
    const id = uuidv4();
    const date = new Date();
   
    const formattedDate = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
    const { name, amount, tenure, reason, employmentStatus, address } = request.body;
   
    action = "PENDING"

    const postApplicantQuery = `
      INSERT INTO applicants3 ( name, amount, tenure, reason, employmentStatus, address, date,id,action)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?);
    `;

    await db.run(postApplicantQuery, [
      name,
      amount,
      tenure,
      reason,
      employmentStatus,
      address,
      formattedDate,
      id,
      action,
    ]);

    response.status(200).send("Applicant Successfully Added");
  } catch (error) {
    console.error("Error inserting applicant:", error);
    response.status(500).send("Internal Server Error");
  }
});



// PUT - Update action for a specific applicant
app.put("/api/applicants/:id", async (request, response) => {
  const { id } = request.params;
  const { action } = request.body;

  try {
    const updateQuery = `
      UPDATE applicants3
      SET action = ?
      WHERE id = ?;
    `;
    await db.run(updateQuery, [action, id]);
    response.status(200).send("Action updated successfully");
  } catch (error) {
    console.error("Failed to update action:", error);
    response.status(500).send("Internal Server Error");
  }
});
