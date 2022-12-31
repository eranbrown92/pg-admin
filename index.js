const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();

app.use(express.json());
app.use(cors());

// get all todos
app.get("/todos", async (req, res) => {
  try {
    const query = "SELECT * FROM todos";
    const allTodos = await pool.query(query);
    res.json(allTodos.rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get todo by id
app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const found = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (found.rowCount == 0) throw "Todo not found!";
    res.json(found.rows);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// create a todo
app.post("/todos", async (req, res) => {
  const { name } = req.body;
  try {
    // check for dupes
    const found = await pool.query("SELECT * FROM todos where name = $1", [
      name,
    ]);
    if (found.rowCount == 1) throw "Todo already exists!";
    const query = "INSERT INTO todos(name) VALUES($1) RETURNING *";
    const newTodo = await pool.query(query, [name]);
    res.status(201).json({ msg: "Todo Created!", data: newTodo.rows });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//update a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const found = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (found.rowCount == 0) throw "Todo not found!";
    const query = "UPDATE todos SET name = $1 WHERE id = $2";
    await pool.query(query, [name, id]);
    res.json({ msg: "Todo updated" });
  } catch (error) {
    res.status(400).json({ err: "Todo not found" });
  }
});

// delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const found = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
    if (found.rowCount == 0) throw "Todo not found!";
    const query = "DELETE FROM todos WHERE id = $1";
    await pool.query(query, [id]);
    res.json({ msg: "Todo deleted" });
  } catch (error) {
    res.json(error);
  }
});

app.listen(5000, () => {
  console.log("server listening on port 5000");
});
