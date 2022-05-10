const http = require("http");
const router = require('./router');
const routes = require('./routes');
// const {getCorsDomain} = require("./common/properties")

// handle the error safely
process.on('uncaughtException', function(err) {
    console.log('uncaughtException');
    console.error(err.stack);
    console.log(err);
});

const server = http.createServer(async (req, res) => {
    const result = await router(req, res, routes);
    res.writeHead(result.statusCode, result.headers);
    res.write(JSON.stringify(result.body));
    res.end();
})

const PORT = 8000
server.listen(PORT, () => {
    console.log(`server is listening on PORT ${PORT}`)
})