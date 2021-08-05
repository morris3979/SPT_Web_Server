import * as express from "express";
import * as path from "path";

const pageRouter = express.Router();

pageRouter.get("/sorted", async (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../../public") });
});

pageRouter.get("/broadcast", async (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../../public") });
});

pageRouter.get("/maintain", async (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../../public") });
});

pageRouter.get("/treatmentitem", async (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../../public") });
});

pageRouter.get("/WaitingnumberList", async (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../../public") });
});


pageRouter.get(
  "/treatmentSites/:siteId/:itemIds",
  async (req: express.Request, res) => {
    res.sendFile("index.html", {root: path.join(__dirname, "../../public")});
    return;
  }
);

export default pageRouter;
