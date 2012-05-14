var http = require("http"),
    util  = require("util"),
    nodeStatic = require("node-static/lib/node-static"),
    faye = require("faye/node/faye-node"),
    url = require("url");


function LiveStats(options) {
    if (!(this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    this.settings = {
        port: options.port,
        geoipServer: {
            hostname: options.geoipServer.hostname,
            port: options.geoipServer.port || 80
        }
    };

    function init() {
        self.bayeux = self.createBayeuxServer();
        self.httpServer = self.createHTTPServer();
        self.bayeux.attach(self.httpServer);
        self.httpServer.listen(self.settings.port);
        util.log("Server started on PORT " + self.settings.port);
    };

    this.createBayeuxServer = function () {
        var bayeux = new faye.NodeAdapter({
            mount: '/faye',
            timeout: 45
        });

        return bayeux;
    };

    this.ipToPosition = function (ip, callback) {
        var client = http.createClient(self.settings.geoipServer.port,
                                       self.settings.geoipServer.hostname);

        var request = client.request("GET", "/geoip/api/locate.json?ip=" + ip, {
            "host": self.settings.geoipServer.hostname
        });

        request.end();
        request.addListener("response", function (response) {
            response.setEncoding("utf8");

            var body = "";
            response.addListener("data", function (chunk) {
                body += chunk;
            });

            response.addListener("end", function () {
                var json = JSON.parse(body);

                if (json.latitude && json.longitude) {
                    callback(json.latitude, json.longitude, json.city);
                }
            });
        });
    };

    this.createHTTPServer = function () {
        return http.createServer(function (request, response) {
            var file = new nodeStatic.Server("./public", {
                cache: false
            });

            request.addListener("end", function () {
                var location = url.parse(request.url, true),
                    params = (location.query || request.headers);

                switch (request.method) {
                case "GET":
                    switch (location.pathname) {
                    case "/config.json":
                        //util.log(util.inspect(request));
                        response.writeHead(200, {
                            "Content-Type": "application/x-javascript"
                        });
                        var jsonString = JSON.stringify({
                            port: self.settings.port,
                            fayeMountPoint: "/faye"
                        });
                        response.end(jsonString);
                        break;
                    case "/stat":
                        self.ipToPosition(params.ip, function (latitude, longitude, city) {
                            self.bayeux.getClient().publish("/stat", {
                                title: params.title,
                                latitude: latitude,
                                longitude: longitude,
                                city: city,
                                ip: params.ip
                            });
                        });

                        response.writeHead(200, {
                            "Content-Type": "text/plain"
                        });

                        response.write("OK");
                        response.end();
                        break;
                    default:
                        file.serve(request, response);
                    }
                }
            });
        });
    };

    init();
};

module.exports = LiveStats;
