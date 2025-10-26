import { Command } from "commander"
import http from "http"
import fs from "fs"
import url from "url"
import path from "path"

const program = new Command()

program
    .name("WebBackend-5")
    .description("")
    .version("1.0.0")

program
    .requiredOption("-p, --port <number>", "Server port")
    .requiredOption("-h, --host <string>", "Server host", "localhost")
    .requiredOption("-c, --cache <path>", "Directory to cache")

program.parse(process.argv)
const options = program.opts()

if(!options.port || !options.host || !options.cache){
    console.error('Please input all required options (port / host / cache path)')
    process.exit(1)
}

const cachePath = path.resolve(options.cache)

if(!fs.existsSync(cachePath)){
    fs.mkdirSync(cachePath, {recursive: true})

    console.log(`Your directory successfully created: ${cachePath}`)
}else{
    console.log(`Your directory is already exists: ${cachePath}`)
}

const server = http.createServer(async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('ok')
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal server error')
    }
})

server.listen(options.port, options.host , () => {
    console.log(`Server is started on http://${options.host}:${options.port}`)
})