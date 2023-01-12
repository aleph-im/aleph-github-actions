import { globSource } from 'ipfs'
import WebSocket from 'ws'

/**
 * Outputs the object argument, to be further used as Shell variables
 * ex: key1=value1 key2=value2 ...
 * 
 * @param vars {object} The variables to export
*/
export const exportVars = (vars, prefix='OUT_') => console.log(Object.entries(vars).map(([k, v]) => `${prefix + k}=${v}`).join(' '))


/** 
 * Takes an ipfs instance as a parameter and adds all the file specified 
 * in the environment variable "BUILD_DIR_PATH" with "GLOB_PATTERN" to it.
 * Returns the whole directory CID
 * 
 * @param ipfs {IPFS} A started ipfs instance
 * @returns Promise The directory CID
*/
export const wrapBuild = async (ipfs, srcDir, globPattern) => {
    let cid;

    for await (const file of ipfs.addAll(
        globSource(srcDir, globPattern, { recursive: true }),
        { pin: false, wrapWithDirectory: true, timeout: 10_000 })
    ) {
        cid = file.cid
    }

    return cid.toString()
}


/**
 * Checks if argument is a string and if it's not empty (after trim)
 * 
 * @param x The input to verify
 * @returns {Boolean} true if it satisfies the condition
 */
export const isANonEmptyString = x => typeof x === 'string' && x.trim().length > 0


/**
 * A simple helper to get the URL of a message in the Aleph explorer
 * 
 * @param {String} blockchain The blockchain Symbol the message was sent on
 * @param {String} address The address the message was sent from
 * @param {String} hash The hash of the message 
 * @returns {String} url A direct link to the message in the Aleph explorer
 */
export const getExplorerURL = (blockchain, address, hash) => (
    `https://explorer.aleph.im/${blockchain}/address/${address}/message/STORE/${hash}`
)


/**
 * A simple helper to get the content of an item given it's cid
 * 
 * @param {String} cid The cid (hash) of the file.
 * @returns {String} url A direct link to the content on ipfs.io
 */
export const getIPFSURL = cid => `https://ipfs.io/ipfs/${cid}`


/**
 * Opens a websocket and listens until message with the provided hash is pushed.
 * 
 * @param {String} hash 
 * @param {Number} timeout 
 * @returns Promise Resolves to true or rejects if it reaches timeout
 */
export const getConfirmation = (hash, timeout=900_000) => new Promise((res) => {
    const ws = new WebSocket(`wss://api2.aleph.im/api/ws0/messages`)
    setTimeout(() => {
        ws.close()
        return reject(false)
    }, timeout)

    ws.on('message', msg => {
        const raw = msg
        try {
            const { item_hash } = JSON.parse(raw)
            if(item_hash === hash){
                ws.close()
                return res(true)
            }
        } catch (err) {
            // Fail silently as we do not want to output to stdout
        }
    })
})
