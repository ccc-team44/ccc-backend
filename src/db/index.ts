import nano0 from "nano";

const nano = nano0("http://admin:1111@172.26.130.31:5984");

const db = nano.use("tweets");

export default db;
