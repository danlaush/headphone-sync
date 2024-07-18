import fs from "fs/promises";
import { execSync } from "child_process";
import path from 'path';
import 'dotenv/config';
const {STORE} = process.env;

// const STORE = "/Volumes/XTRAINERZ/";

export async function modifyFileSpeed(filename, speed) {
    console.log(`Speed modifying to ${speed} - ${filename}`)
    const filepath = path.join(STORE,filename)
    const modifiedFilepath = path.join(STORE,`${speed}x-${filename}`)
    console.log({filepath,modifiedFilepath})
    // ffmpeg create a new file
    const ffmpegCommand = `ffmpeg -i "${STORE}${filename}" -filter:a "atempo=${speed}" "${modifiedFilepath}"`;

    try {
        const r = await execSync(ffmpegCommand)
    } catch (error) {
        console.log('error running ffmpeg')
        console.log(error)
        return
    }
    // delete the original

    try {
        await fs.unlink(filepath);
    } catch (error) {
        console.log('error deleting the original')
        console.log(error)
        return
    }
    // rename the new

    try {
        await fs.rename(modifiedFilepath, filepath)
    } catch (error) {
        console.log('error renaming file back to original')
        console.log(error)
        return;
    }

    console.log(`Speed successfully modified to ${speed} - ${filename}`)
}

// modifyFileSpeed("Pivot - Trump VP Pick, Assassination Attempt Aftermath, and Guest David Plouffe.mp3", 1.5)
// modifyFileSpeed("Risky Business - Wide World of Cyber State directed cybercrime.mp3", 1.5)