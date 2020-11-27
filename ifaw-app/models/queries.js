var http = require('http');

module.exports = {
	getAllUsers: () => {
        var result = "";
        return http.get("http://localhost:3500/users", (res) => {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                result = body;
            });
        }).end;
        console.log("lol " + result);
        return result;
    },
    
    callAPI: (url) => {
        return new Promise((resolve, reject) => {
            const req = http.request(url, (res) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                   return reject(new Error('statusCode=' + res.statusCode));
                }
                var body = [];
                res.on('data', function(chunk) {
                    body.push(chunk);
                });
                res.on('end', function() {
                    try {
                        body = JSON.parse(body);
                    } catch(e) {
                        reject(e);
                    }
                    resolve(body);
                });
            });
            req.on('error', (e) => {
                reject(e.message);
            });
            req.end();
        });
    }
};
  