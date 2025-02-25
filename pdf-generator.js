const PDFDocument = require('pdfkit');
const fs = require('fs');
const { NumberToLetter } = require("convertir-nombre-lettre");

// initializing methods
function formatTo(value) {
   if (value<10) {
      return ["0",value].join("")
   }
   return value
}

function getCurrentDate() {
   const dt = new Date()
   const year = dt.getFullYear()
   var month = ""
   month = formatTo(dt.getMonth()+1)
   const date = formatTo(dt.getDate())
   const hour = formatTo(dt.getHours())
   const minute = formatTo(dt.getMinutes())
   return year+"_"+month+"_"+date+"__"+hour+"_"+minute;
}

function getCurrentFrenchDateString() {
   const dt = new Date()
   const year = dt.getFullYear()
   var month = ""
   month = formatTo(dt.getMonth()+1)
   if (month == "01") {
    month = "Janvier"
   }
   if (month == "02") {
    month = "Février"
   }
   if (month == "03") {
    month = "Mars"
   }
   if (month == "04") {
    month = "Avril"
   }
   if (month == "05") {
    month = "Mai"
   }
   if (month == "06") {
    month = "Juin"
   }
   if (month == "07") {
    month = "Juillet"
   }
   if (month == "08") {
    month = "Août"
   }
   if (month == "09") {
    month = "Septembre"
   }
   if (month == "10") {
    month = "Octobre"
   }
   if (month == "11") {
    month = "Novembre"
   }
   if (month == "12") {
    month = "Décembre"
   }
   const date = formatTo(dt.getDate())
   const hour = formatTo(dt.getHours())
   const minute = formatTo(dt.getMinutes())
   return date+" "+month+" "+year;
}

// Initializing variables
const FONT_SIZE = 12

const LINE_HEIGHT = 14

const MARGIN_LEFT_UNITE = 270

const MARGIN_LEFT_MONTANT = 370

const DYNAMIC_WIDTH = 70

const DYNAMIC_WIDTH_DECREASE = 100


function exportPDF(commandes, phone, nom, nomSociete, response) {
    // maximum recommandé est 5 commandes pour une meilleure visibilité
    // Crée un nouveau document PDF
    const doc = new PDFDocument();

    const CLIENT = {
            "name":nom,
            "fonction":"Responsable d'achat et contrat",
            "enterprise":nomSociete,
            "telephone":phone
        };
    if(CLIENT.name.length>23) {
        //console.log("mihoatra: "+CLIENT.name.length)
        CLIENT.name = CLIENT.name.slice(0,23)+'.'
    }
    if(CLIENT.fonction.length>34) {
        //console.log("mihoatra: "+CLIENT.fonction.length)
        CLIENT.fonction = CLIENT.fonction.slice(0,34)+'.'
    }
    if(CLIENT.enterprise.length>34) {
        //console.log("mihoatra: "+CLIENT.enterprise.length)
        CLIENT.enterprise = CLIENT.enterprise.slice(0,34)+'.'
    }
    // save date of created pdf into filename
    const dt = getCurrentDate();

    // save name of client into filename
    var nme = CLIENT.name.replaceAll("'","_");
        nme = nme.replaceAll(" ","_");
        nme = nme.replaceAll(".","");

    // save name of enterprise into filename
    var entrp = CLIENT.enterprise.replaceAll("'","_");
        entrp = entrp.replaceAll(" ","_");
        entrp = entrp.replaceAll(".","");

    const FILENAME = `DEVIS_${nme}_${entrp}_${dt}`.toLowerCase();

    var DESTINATION_OUTPUT = `uploads/${FILENAME}.pdf`;

    // Embed a font, set the font size, and render some text
    /* 
    CAPITONNAGE CONFORT
    */
    doc
        .font('Times-Bold')
        .fontSize(FONT_SIZE)
        .text('CAPITONNAGE CONFORT', 50, 50+(LINE_HEIGHT*0));

    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('Lot IVR III Ambohibary Antanimena', 50, 50+(LINE_HEIGHT*1));

    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('ANTANANARIVO 101', 50, 50+(LINE_HEIGHT*2));

    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('Tel: 0340186045', 50, 50+(LINE_HEIGHT*3));

    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('       0337888758', 50, 50+(LINE_HEIGHT*4));

    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('Email: capitonnageconfort3@gmail.com', 50, 50+(LINE_HEIGHT*5));

    /*
    ALLIANCE FRANCAISE
    */
    doc
        .font('Times-Bold')
        .fontSize(FONT_SIZE)
        .text('DEVIS', 400, 50+(LINE_HEIGHT*0));

    const width = doc.widthOfString("DEVIS")
    const height = doc.currentLineHeight()
    doc.underline(400, 50, width, height, {color: "black"})

    const list_rows_client = [
        {
            "text": "Adressé à:"
        },
        {
            "text": CLIENT.name
        },
        {
            "text": CLIENT.fonction
        },
        {
            "text": CLIENT.enterprise
        },
        {
            "text": CLIENT.telephone
        },

    ];

    list_rows_client.forEach((row, index)=>{
        doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text(`${row.text}`, 340, 50+(LINE_HEIGHT*(index+1)));
    });

    // Ajoute un espace avant le tableau
    doc.moveDown();

    // Variables de position
    let startX = 50;
    let startY = 140;
    let cellWidth = 200;
    let cellHeight = 25;

    // Crée le tableau avec des bordures
      var currentY = startY + (cellHeight * 1);
      const paddingTop = 8
      const paddingLeft = 5

      // row 1 thead
      doc.rect(startX, currentY, cellWidth + DYNAMIC_WIDTH, cellHeight).stroke();
      doc.fontSize(12).text("Désignation", startX + paddingLeft, currentY + paddingTop);
      doc.rect(startX + MARGIN_LEFT_UNITE, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
      doc.fontSize(12).text("Unité", startX + paddingLeft + MARGIN_LEFT_UNITE, currentY + paddingTop);
      doc.rect(startX + MARGIN_LEFT_MONTANT, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
      doc.fontSize(12).text("Montant", startX + paddingLeft + MARGIN_LEFT_MONTANT, currentY + paddingTop);

      // row 2 tbody
      currentY = startY + (cellHeight * commandes.length);
      var montantTotalCommande = 0;
      commandes.forEach((item, index)=>{
        loadBodyTemplate(doc, item, startX, startY + (cellHeight*index), cellWidth, cellHeight, paddingLeft, paddingTop)
        montantTotalCommande += (item.prixunitaire*item.quantite)
      });

      // row 3 tfoot
      currentY = startY + (cellHeight * (commandes.length + 2));
      doc.rect(startX + MARGIN_LEFT_UNITE, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
      doc.fontSize(12).text("TOTAL", startX + paddingLeft + MARGIN_LEFT_UNITE, currentY + paddingTop);
      doc.rect(startX + MARGIN_LEFT_MONTANT, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
      doc.fontSize(12).text(montantTotalCommande, startX + paddingLeft + MARGIN_LEFT_MONTANT, currentY + paddingTop);

    // Termine le document tableau PDF

    startY = 350
    currentY = startY+(LINE_HEIGHT*0)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text(`Arrêté le présent devis à la somme de : ${NumberToLetter(montantTotalCommande)} Ariary.`, 50, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text('NB: ', 50, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text("- Fournitures et main d' œuvre y compris", 50, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1)
    const DURATION = 30
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text(`- Délai d'execution : ${DURATION} jours`, 50, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1) 
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text("- Avance 50% à la signature du contrat", 50, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text("- Reste 50% à la fin des Travaux", 50, currentY);

    startX = 340
    startY = currentY + 150
    currentY = startY+(LINE_HEIGHT*1)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text(`Antananarivo, ${getCurrentFrenchDateString()}`, startX, currentY);

    startY = currentY
    currentY = startY+(LINE_HEIGHT*1)
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text("La gérante,", startX, currentY);

    startY = currentY
    currentY = startY+100
    doc
        .font("Times-Roman")
        .fontSize(FONT_SIZE)
        .text("RABEARISON Vonin' Ala Priscilla.", startX, currentY);

    //console.log('Le fichier PDF avec bordures a été créé avec succès.');

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    const stream = fs.createWriteStream(DESTINATION_OUTPUT)
    doc.pipe(stream);

    // Termine le document contenant l'entête
    doc.end();
    console.log("***generating pdf***")
    console.log(">>>completed<<<")
    stream.on('finish', () => {
        response.download(DESTINATION_OUTPUT);
    });
}


// function
  function loadBodyTemplate(doc, row, startX, startY, cellWidth, cellHeight, paddingLeft, paddingTop) {
    //row = ["Confection d'une bâche de camion JMC", "1.650.000", "1.650.000"]
    //padding
    let currentY = startY + (cellHeight * 2);
    // borderSize
    doc.rect(startX, currentY, cellWidth + DYNAMIC_WIDTH, cellHeight).stroke();
    doc.rect(startX + MARGIN_LEFT_UNITE, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
    doc.rect(startX + MARGIN_LEFT_MONTANT, currentY, cellWidth - DYNAMIC_WIDTH_DECREASE, cellHeight).stroke();
    // contentValue
    doc.fontSize(12).text(row.designation, startX + paddingLeft, currentY + paddingTop);
    doc.fontSize(12).text(row.prixunitaire, startX + paddingLeft + MARGIN_LEFT_UNITE, currentY + paddingTop);
    doc.fontSize(12).text(row.prixunitaire*row.quantite, startX + paddingLeft + MARGIN_LEFT_MONTANT, currentY + paddingTop);
  }

module.exports.exportPDF = exportPDF;

