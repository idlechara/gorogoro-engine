"use strict";

let fs = require('fs');
let XLSX = require("xlsx");
let normalize = require("./remove_diacritics.js");
// import normalize from "./remove_diacritics";

let get_schedule = function (workbook_path) {
    return new Promise((resolve, reject) => {

        let workbook = XLSX.readFile(workbook_path);
        // console.log("Workbook sheet names:");
        // workbook.SheetNames.map(item => console.log("\t" + item));

        let assignment = [];

        // Define this as the sheet to use, 0 by default
        let days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let block_data = {};

        for (let day_idx = 0; day_idx < 5; day_idx++) {
            for (let block_idx = 1; block_idx <= 11; block_idx++) {
                let blockname = days[day_idx] + block_idx;
                for (let course = 4; course < 180; course++) {
                    let cell_address = XLSX.utils.encode_cell({ c: 1 + (day_idx * 11) + (block_idx), r: course })
                    let cell = sheet[cell_address];
                    try {
                        let course_name = XLSX.utils.encode_cell({ c: 1, r: course });
                        course_name = sheet[course_name].v;
                        //Check if not painted
                        if (cell.XF.data.patternType == null && typeof course_name !== "undefined") {
                            // Check that is actually used
                            if (cell.v !== "solid") {
                                if (typeof block_data[blockname] === "undefined") {
                                    block_data[blockname] = [];
                                }
                                block_data[blockname].push(course_name);
                            }
                        }
                    }
                    catch (error) {
                        // Nothing! :)
                    }
                }
            }
        }
        resolve(block_data);
    });
}

module.exports = {
    schedule_parser : get_schedule
}