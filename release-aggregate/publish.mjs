import { ImportAccountFromMnemonic } from "aleph-sdk-ts/dist/accounts/ethereum.js";
import { messages } from "aleph-sdk-ts";
import { exportVars, getExplorerURL, isANonEmptyString } from "./helpers.js";

const main = async () => {
  const { ALEPH_ACCOUNT_MNEMONIC, IPFS_CID, APP_NAME } = process.env

  if([ALEPH_ACCOUNT_MNEMONIC, IPFS_CID, APP_NAME].some(x => !isANonEmptyString(x))) 
    throw new Error('Missing required environment variables.')

  const account = ImportAccountFromMnemonic(ALEPH_ACCOUNT_MNEMONIC.trim())
  if(!account) throw new Error('Invalid mnemonic.')

  const message = await messages.aggregate.Publish({
    account,
    key: 'releases',
    channel: 'ALEPH_RELEASES',
    content: {
      [APP_NAME]: {
        ipfs_cid: IPFS_CID,
        issued_at: new Date().toISOString(),
        domain_message_ref: null
      }
    }
  })

  exportVars({
    REQUEST_MSG_HASH: message.item_hash,
    EXPLORER_URL: getExplorerURL(message.item_hash) 
  })
}

main()