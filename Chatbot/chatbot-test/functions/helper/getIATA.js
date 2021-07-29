var json = require('./airports2.json');
// console.log(json.filter((e)=>e.city=== 'Berlin'))

const getIATA=(city)=>{
    let x= json.filter((e)=>e.city===city)
    let y=x.map((e)=>e.iata_code)
    
    return y
}

module.exports.getIATA=getIATA