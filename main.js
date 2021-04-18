let fs = require('fs');
let dbus = require('dbus-next');
let bus = dbus.sessionBus();
let Variant = dbus.Variant;
let vals = {};

var main = async function () {
  let obj2 = await bus.getProxyObject('org.freedesktop.DBus', '/org/freedesktop/DBus');
  let list = obj2.getInterface("org.freedesktop.DBus");
  let allServices = await list.ListNames();
  //let mprisProxy = allServices.find((v) => v.startsWith("org.mpris.MediaPlayer2"));
  allServices.forEach(async (v) => {
    if (!v.startsWith("org.mpris.MediaPlayer2"))
      return;
    else {
      let mprisProxy = v;
      if (mprisProxy !== undefined) {
        let obj = await bus.getProxyObject(mprisProxy, '/org/mpris/MediaPlayer2');
        await obj.bus.call(new dbus.Message({
          type: 1,
          _sent: false,
          _serial: null,
          path: '/org/mpris/MediaPlayer2',
          interface: 'org.freedesktop.DBus.Properties',
          member: 'Get',
          errorName: undefined,
          replySerial: undefined,
          destination: mprisProxy,
          sender: undefined,
          signature: 'ss',
          body: ["org.mpris.MediaPlayer2.Player", "Metadata"],
          flags: 0
        })).then((v) => {
          var retVal = v.body[0].value;
          let changed = false;
          Object.keys(retVal).forEach((x) => {
            if (retVal[x].value.push !== undefined)
              retVal[x].value = retVal[x].value[0]

            var keyVal = x.split(":", 2)[1];

            if (Object.keys(vals).indexOf(keyVal) < 0 || vals[keyVal] != retVal[x].value && retVal[x].value != "") {
              changed = true;
              vals[keyVal] = retVal[x].value;
            }

          });
          if (changed) {
            var app = "unknown"
/*            if (mprisProxy.indexOf("chromium") >= 0)
              app = "Chrome/Chromium"
            else if (mprisProxy.indexOf(".firefox.") >= 0)
              app = "Firefox";
            else*/
              app = mprisProxy;

            let outData = "";
            //outData += "💻 " + app + "\n";
            //outData += "📺 - Artist/Channel: " + vals["artist"]+"\n" ;
            //outData += "🔈 - Song: " + vals["title"];
            outData += ""+vals["artist"]+"\n" ;
            outData += ""+vals["title"];
            console.log(outData);

            let file = fs.writeFileSync('/tmp/audio.txt',outData,{encoding: 'utf-8'});
          }

        }, (r) => console.log(r));
      }

    }
  });

}

setInterval(main, 1000);
