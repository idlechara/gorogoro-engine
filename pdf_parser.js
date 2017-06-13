"use strict";

let fs = require('fs'), PDFParser = require("pdf2json");

let get_pdf_pages = function(pdfData) {
    return Array.from(pdfData.formImage.Pages).map((item) => {
        return Array.from(item.Texts).map((textnode) => {
            return {
                x : textnode.x,
                y : textnode.y,
                text: decodeURI(textnode.R[0].T)
            };
        });
    });
}

let grab_course_structure = function(pdfPage){
    let course_name = pdfPage.filter((item)=>{ return item.x==8.592 && item.y==13.08 })[0].text;

    let alumni = 
        pdfPage.filter(item => {return item.x==6.59})
        .map(item => {
            if(item.text == "Nombre del Alumno") return null;
            return {
                name: item.text,
                enrollment: pdfPage.filter(subitem => { return subitem.y==item.y})[2].text,
                year: pdfPage.filter(subitem => { return subitem.y==item.y})[2].text.substring(0,4)
            }
        })
        .filter(item => item);
    return {
        course: course_name,
        alumni: alumni
    };
}

let parse_pdf = function(pdf_path){
    return new Promise((resolve, reject)=>{
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => {
            console.error(errData.parserError);
            reject(errData.parserError);
        } );
        pdfParser.on("pdfParser_dataReady", pdfData => {
            let pdf_pages = get_pdf_pages(pdfData);
            let course = [];
            pdf_pages.map((page)=>{
                course.push(grab_course_structure(page));
            });
            resolve(course);
            fs.writeFile("./output.json", JSON.stringify(course, null, 4));
        });
        pdfParser.loadPDF(pdf_path);
    });
};

module.exports = {
    pdf_parse: parse_pdf
}