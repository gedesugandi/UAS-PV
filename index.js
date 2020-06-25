const electron = require('electron');
const uuid = require("uuid");
const fs = require("fs");
const { v4 } = uuid;
const{app, BrowserWindow, Menu, ipcMain} = electron;
let indexWindow;
let createWindow;
let listWindow;
let allAppointment = [];
let PenyimpananBarang = [];

// tampilkan data_barang
fs.readFile("db_barang.json", (err, JsonAppointment) =>{
  if(!err){
      const oldAppointment = JSON.parse(JsonAppointment);
      PenyimpananBarang = oldAppointment;
  }
});

app.on("ready", () =>{
  indexWindow = new BrowserWindow({
      webPreferences:{
          nodeIntegration: true
      },
      width: 1224,
      height: 600,
      title: "Aplikasi Kasir Sederhana"
  });

  indexWindow.loadURL(`file://${__dirname}/index.html`);
  indexWindow.on("closed", ()=>{
      app.quit();
      indexWindow = null;
  });

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
  
});
ipcMain.on("appointment:creates", (event, appointment) =>{
  appointment["id"] = uuid.v1();
  appointment["done"] = 0;
  allAppointment.push(appointment);
  indexWindow.reload();
});

ipcMain.on("appointment:request:list", event => {
  indexWindow.webContents.send('appointment:response:list', allAppointment);
});


const CreateWindowCreator = () =>{
  createWindow = new BrowserWindow({
      webPreferences:{
          nodeIntegration: true
      },
      width: 600,
      height: 400,
      title:"Tambah Barang"
  });
  createWindow.setMenu(null);
  createWindow.loadURL(`file://${__dirname}/tambah_barang.html`);
  createWindow.on("closed", ()=> (createWindow = null));
};

const ListWindowCreator = () =>{
  listWindow = new BrowserWindow({
      webPreferences:{
          nodeIntegration: true
      },
      width: 600,
      height: 400,
      title:"Data Barang"
  });
  listWindow.setMenu(null);
  listWindow.loadURL(`file://${__dirname}/data_barang.html`);
  listWindow.on("closed", ()=> (listWindow = null));
};



ipcMain.on("appointment:simpanBarang", (event, appointment) =>{
  appointment["id"] = uuid.v1();
  appointment["done"] = 0;
  PenyimpananBarang.push(appointment);
  
  // simpan ke db json
  const jsonAppointment = JSON.stringify(PenyimpananBarang);
  fs.writeFileSync("db_barang.json",jsonAppointment);

  createWindow.close();
  console.log(PenyimpananBarang);
});
ipcMain.on("appointment:request:listBarang", event => {
  listWindow.webContents.send('appointment:response:listBarang', PenyimpananBarang);
});



const  menuTemplate = [{
  label: "File",
  submenu : [{
          label : "Data Barang",
          click(){
            ListWindowCreator();
          }
      },
      {
          label : "Tambah Barang Baru",
          click(){
            CreateWindowCreator();
          }
      }
  

  ]
},

{
  label:"View",
  submenu : [{role:"reload"}, {role:"toggledevtools"}]
},

{
  label : "Quit",
  accelerato : process.platform == "darwin" ? "Command+Q" : "Ctrk + Q",
  click(){
      app.quit();
  }
},

]