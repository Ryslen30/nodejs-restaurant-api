const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const kitchenRoutes = require("./routes/kitchenRoutes");
app.use("/kitchen", kitchenRoutes);

app.get("/", (req, res) => res.redirect("/kitchen/dashboard"));

const PORT = 3000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
