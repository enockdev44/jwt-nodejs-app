const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { NumberToLetter } = require('convertir-nombre-lettre');

// environment variables
dotenv.config();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

//app.use(cors());


/* for Angular Client (withCredentials) */
app.use(
   cors({
     credentials: true,
     origin: [process.env.CLIENT_DEV]
   })
 );


app.use(express.static(__dirname + '/uploads'));

const port = process.env.PORT || 3000;

app.get(['/','/api'], (req,res)=>{
    res.send({message:'welcome to razenkoder API'})
})

// tools
app.post("/api/tools/convert-number-letter", (req,res) => {
    if(!req.body.nombre) res.status(404).send({error:{message: "parameter 'nombre' is required"}});
    const { nombre } = req.body;
    const result = NumberToLetter(nombre);
    res.send({result:result});
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);


// server is running...
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});
