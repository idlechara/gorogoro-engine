"use strict";

let pdf_parser = require("./pdf_parser").pdf_parse;
let schedule_parser = require("./horarios").schedule_parser;

Promise.all([pdf_parser("./input.pdf"), schedule_parser("./horarios.xls")])
.then(values => {
    let course_mapping = values[0];
    let block_mapping = values[1];

    // Get primary statistics
    let totalAlumniPerGeneration = {};
    course_mapping.map(course => {
        course.alumni.map(alumni => {
            if(typeof totalAlumniPerGeneration[alumni.year] === "undefined"){
                totalAlumniPerGeneration[alumni.year] = new Set();
            }
            totalAlumniPerGeneration[alumni.year].add(alumni.enrollment);
        });
    });
    for (var key in totalAlumniPerGeneration) {
        if (totalAlumniPerGeneration.hasOwnProperty(key)) {
            totalAlumniPerGeneration[key] = totalAlumniPerGeneration[key].size;
        }
    }
    // console.log(totalAlumniPerGeneration);

    // Get busy alumni
    let target = "Jueves3";

    console.log("Targeting block: " + target);

    let totalBusyAlumniPerGeneration = {};
    // console.log();
    if(typeof block_mapping[target] === "undefined"){
        console.log("Worry not, you have found a block on which no one has classes. 100% success.");
        return;
    }
    course_mapping.filter ( course => block_mapping[target].indexOf(course.course) > -1 )
    .map(course => {
        console.log("COURSE HIT! " + course.course);
        course.alumni.map(alumni => {
            if(typeof totalBusyAlumniPerGeneration[alumni.year] === "undefined"){
                totalBusyAlumniPerGeneration[alumni.year] = new Set();
            }
            totalBusyAlumniPerGeneration[alumni.year].add(alumni.enrollment);
        });
    });
    for (var key in totalBusyAlumniPerGeneration) {
        if (totalBusyAlumniPerGeneration.hasOwnProperty(key)) {
            totalBusyAlumniPerGeneration[key] = totalBusyAlumniPerGeneration[key].size;
        }
    }

    for (var key in totalAlumniPerGeneration) {
        if (totalBusyAlumniPerGeneration.hasOwnProperty(key)) {
            totalAlumniPerGeneration[key] = {
                total: totalAlumniPerGeneration[key],
                busy: totalBusyAlumniPerGeneration[key],
                success_ratio: (((totalAlumniPerGeneration[key]-totalBusyAlumniPerGeneration[key])/totalAlumniPerGeneration[key])*100.0).toFixed(0) + "%"
            }
        }
        else{
            totalAlumniPerGeneration[key] = {
                total: totalAlumniPerGeneration[key],
                busy: 0,
                success_ratio: (100.0).toFixed(0) + "%"
            }
        }
    }

    console.log(totalAlumniPerGeneration);
})