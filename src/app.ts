import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import path from "path";
import * as homeController from "./controllers/home";
import * as apiController from "./controllers/api";
import cors from "cors";

// Create Express server
const app = express();
app.use(cors());
// Express configuration
app.set("port", process.env.PORT || 8002);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/all-coordinates", apiController.allCoordinates);
app.get("/api/lang-count", apiController.langCount);
app.get("/api/lang", apiController.lang);
app.get("/api/scomo", apiController.scomo);
app.get("/api/retweet", apiController.retweet);
app.get("/api/scomo-location", apiController.scomoLocation);
app.get("/api/stream", apiController.stream);


export default app;
