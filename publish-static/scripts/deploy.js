/** 
 * DEPLOY ON ALEPH
 * This Github action pins static assets using the Aleph network.
 * 
 * For more information about Aleph, check out:
 * https://aleph.im
*/

import aleph from 'aleph-sdk-ts'
import { create } from 'ipfs'
import { exportVars, getConfirmation, getExplorerURL, getIPFSURL, isANonEmptyString, wrapBuild } from './helpers.js'

const main = async () => {
  const {
    ALEPH_ACCOUNT_MNEMONIC,
    ALEPH_ACCOUNT_PRIVATE_KEY,
    ALEPH_BLOCKCHAIN,
    ALEPH_ASSETS_PATH,
    ALEPH_GLOB_PATTERN,
    ALEPH_CHANNEL
  } = process.env

  if(
    ![ALEPH_ASSETS_PATH, ALEPH_BLOCKCHAIN, ALEPH_GLOB_PATTERN, ALEPH_CHANNEL]
    .every(isANonEmptyString)
  )
    throw new Error('Some input variables were not properly set')
  
  if (isANonEmptyString(ALEPH_ACCOUNT_MNEMONIC) && isANonEmptyString(ALEPH_ACCOUNT_PRIVATE_KEY))
    throw new Error('Either provide a mnemonic or a private key')

  if (!aleph.accounts.hasOwnProperty(ALEPH_BLOCKCHAIN))
    throw new Error(
      'Unsupported blockchain: Valid values: ' + Object.keys(aleph.accounts).filter(x => x !== 'base').join(', ')
    )
  
  let account
  if (ALEPH_ACCOUNT_PRIVATE_KEY)
    account = aleph.accounts[ALEPH_BLOCKCHAIN].ImportAccountFromPrivateKey(ALEPH_ACCOUNT_PRIVATE_KEY)
  else if (ALEPH_ACCOUNT_MNEMONIC){
    if(!aleph.accounts[ALEPH_BLOCKCHAIN].hasOwnProperty('ImportAccountFromMnemonic'))
      throw new Error('This specific blockchain does not support account importation from mnemonic')
    
    account = aleph.accounts[ALEPH_BLOCKCHAIN].ImportAccountFromMnemonic(ALEPH_ACCOUNT_MNEMONIC)
  }
  else
    throw new Error(`Environment variables are not properly set, missing an ${ALEPH_BLOCKCHAIN} account private key OR mnemonic`)

  // It is important to keep the "silent" option set to true
  // The only stdOut this script should have are the exported variables  
  const ipfs = await create({ silent: true, address: '/dns6/ipfs-2.aleph.im/tcp/443/https' })
  const fileHash = await wrapBuild(ipfs, ALEPH_ASSETS_PATH, ALEPH_GLOB_PATTERN);
  const msg = await aleph.messages.store.Pin({
    APIServer: 'https://api2.aleph.im',
    account,
    fileHash,
    channel: ALEPH_CHANNEL,
  })

  try {
    await getConfirmation(msg.item_hash)
    exportVars({
      FILE_CID: fileHash,
      FILE_URL: getIPFSURL(fileHash),
      MESSAGE_HASH: msg.item_hash,
      EXPLORER_URL: getExplorerURL(account.GetChain(), account.address, msg.item_hash),
    })
  } catch (error) {
    console.log(error)
  }
  finally {
    await ipfs.stop()
    process.exit()
  }
}

main()
