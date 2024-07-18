//
// import { usb, getDeviceList } from 'usb';
import fs from "fs";
const usbDrivePath = "/Volumes/XTRAINERZ";

(async function usbTest() {
  // const devices = getDeviceList();
  // console.log('evices')
  // console.log(devices)

  fs.writeFile(`${usbDrivePath}/test.txt`, "Hey there!", function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
})();
