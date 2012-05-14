var LiveStats = require("./lib/livestats");

process.addListener("uncaughtException", function (err, stack) {
    console.log("-------------------------------");
    console.log("Exception: " + err);
    console.log(err.stack);
    console.log("-------------------------------");
});

new LiveStats({
    port: 8001,
    geoipServer: {
        hostname: "geoip.peepcode.com",
        port: 80
    }
});
