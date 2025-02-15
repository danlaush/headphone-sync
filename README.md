# Headphone sync tool

Homemade apps - this CLI acts as a media library manager for my waterproof headphones which are a basic USB file system. Download podcast mp3s and put them on the device.

Things worth mentioning
- Uses Inquirer.js for the CLI selection, but a [modified version](https://github.com/danlaush/headphone-sync/blob/main/inquirer-checkbox-ordered.mjs#L92-L106) of the [checkbox component](https://github.com/SBoudrias/Inquirer.js/tree/main/packages/checkbox)
- Uses Node's `child_process#execSync` to run ffmpeg directly. Didn't feel like adding another JS lib to wrap it.

## Instructions

1. Have ffmpeg installed, available to Node/command line
1. `pnpm install`
1. Create `.env` with `STORE=/drive/location`
1. `node clear.mjs` clear the store drive
1. `node append.mjs` and follow instructions
   - When presented with podcast titles, use number keys to control playback order


## Screenshots

Delete all items in the storage folder
![Delete all items in the storage folder](./docs/1.png)

Present user with podcast titles available for download. Note the numbered ordering.
![Present user with podcast titles available for download](./docs/2.png)

Fetch files and use ffmpeg to increase playback speed to 1.5x
![Fetch files and increase playback speed](./docs/3.png)

Final output, listing files on storage drive
![Final output, listing files on storage drive](./docs/4.png)
