import { Command } from "commander"
import http from "http"
import fs from "fs/promises"
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

try {
    await fs.access(cachePath)
    console.log(`Your directory is already exists: ${cachePath}`)
} catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(cachePath, { recursive: true });
      console.log(`Your directory successfully created: ${cachePath}`)
    } else {
      console.error('Error setting up cache directory: ', error)
      process.exit(1);
    }
}

const server = http.createServer(async (req, res) => {

    const { method, url} = req
    const imageCode = url.slice(1)
    const filePath = path.join(cachePath, `${imageCode}.jpg`)

    if(method == 'GET'){
        try {
            const fileData = await fs.readFile(filePath)
            res.writeHead(200, { 'Content-Type': 'image/jpeg' })
            res.end(fileData)
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('404 Not Found')
        }
        
    }else if(method == 'PUT'){
        try {
            const chunks = []

            for await(const chunk of req){
                chunks.push(chunk)
            }

            const fileData = Buffer.concat(chunks)

            await fs.writeFile(filePath, fileData)

            res.end('201 Created')
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('500 Internal Server Error')
        }
    }else if(method == 'DELETE'){
        try {
            await fs.unlink(filePath)

            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end('200 Successfully deleted')

        } catch (error) {
            if(error.code == 'ENOENT'){
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                res.end('404 Not found')
            }else{
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Server Error')
            }
        }
    }else{
       res.writeHead(405, { 'Content-Type': 'text/plain' })
       res.end('405 Method not allowed')
    }
})

server.listen(options.port, options.host , () => {
    console.log(`Server is started on http://${options.host}:${options.port}`)
})
