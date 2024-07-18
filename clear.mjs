import fs from "fs/promises";
import confirm from "@inquirer/confirm";
import path from "path";
import 'dotenv/config';

// const STORE = "/Volumes/XTRAINERZ/";

const {STORE} = process.env;

/**
 * Wipe the drive
 */
(async function clear() {
  // list files
  const w = await fs.readdir(STORE);
  console.log("files found:");
  console.log(w);
  const answer = await confirm({ message: "Continue?", default: false });
  console.log({ answer });
  for (const file of w) {
    await fs.unlink(path.join(STORE, file));
  }
  const y = await fs.readdir(STORE);
  console.log("files found:");
  console.log(y);
})();
