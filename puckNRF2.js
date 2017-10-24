var start;
var end;

function showBatteryLevel2(v){
  if(digitalRead(LED1) == 1 ||
     digitalRead(LED2) == 1 ||
     digitalRead(LED3) == 1)
  {
    LED1.reset();
    LED2.reset();
    LED3.reset();
    end=Date.now();
    Puck.magOff();
    return;
  }
  let level=v;
  if (level>75)LED2.set();
  else if (level>45)LED3.set();
  else LED1.set();
  start=Date.now();
  Puck.magOn();
  Puck.on('mag', function(xyz) {
    console.log(xyz);
  });
}

function execute(devices, index){
  if(index < devices.length){
    if(devices[index].hasOwnProperty('name') && startWith(devices[index].name, 'Puck.js')) {
      let gatt = null;
      devices[index].gatt.connect().then(function(g){
        console.log('connect');
        gatt = g;
        console.log(g);
        let ps = null;
        try{
          ps = gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
          console.log(ps);
          return ps;
        } catch(e){
          console.log(e);
          execute(devices,index);
        }
      }).then(function(service) {
        console.log('Service');
        return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      }).then(function(characteristic) {
        console.log('characteristic');
        try{
        characteristic.writeValue("showBatteryLevel2(20)\n");
        }
        catch (f){
        console.log(f);
        }
      }).then(function() {
        if(gatt !== null)
          gatt.disconnect();
        console.log("Done!:" + devices[index].name);
        execute(devices,index+1);
      });
    }
    else{
      execute(devices,index+1);
      return;
    }
  }
  else{
    console.log('Done!');
    return;
  }
}

function startWith(str, substr){
  try{for(let index in substr){
    if(substr[index] !== str[index])
      return false;
  }
  }
  catch (e){}
  return true;
}
function broadcast(){
  showBatteryLevel2(20);
  let devices;
  NRF.findDevices(function(d) {
    devices = d;
    console.log('length:' + devices.length);
    execute(devices,0);
  }, 2000);
}
setWatch(function(){
  broadcast();console.log('Time: '+(end-start)/1000);
  console.log('Temperature: '+E.getTemperature());
},BTN,{repeat:true,edge:'falling',debounce:250});