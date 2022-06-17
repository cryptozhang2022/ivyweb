import { IVY_ABI, IVY_ABI_STAKE, IVY_ABI_UNSTAKE, IVY_ABI_PROCESS_REWARDS } from '@/server/IVY_ABI'
import Contract from 'web3-eth-contract'
import Web3 from 'web3'
import { Toast } from 'vant'
import i18n from '@/assets/lang'

class IVYContract {
  static instanceofObj = null

  static pledgeInstanceofObj = null

  static web3 = null

  static WALLET_TYPE = 'bsc'

  static BLOCKCHAIN_ID = 12

  // IVY代币地址
  static TOKEN_ADDRESS = '0x6603e72C7C8AEAd2014D9FD97F55e4bE254009B1'

  // IVY质押挖矿合约地址
  // static CONTRACT_ADDRESS = '0x867B9D037b9AF69a86e701f25a09d827803E4829'
  static CONTRACT_ADDRESS = '0x00CE333b9E5d4F5d09f63D0d109ff752CCF511e2'

  static PROVIDER_LIST = [
    'https://bsc-dataseed.binance.org/'
  ]

  static TEST_PROVIDER_LIST = [
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-2-s1.binance.org:8545/',
    'https://data-seed-prebsc-1-s2.binance.org:8545/',
    'https://data-seed-prebsc-2-s2.binance.org:8545/',
    'https://data-seed-prebsc-1-s3.binance.org:8545/',
    'https://data-seed-prebsc-2-s3.binance.org:8545/'
  ]

  /**
   * 获取实例对象
   */
  static getInstanceof (address) {
    if (IVYContract.instanceofObj) {
      return IVYContract.instanceofObj
    } else {
      IVYContract.instanceofObj = new IVYContract(address)
      return IVYContract.instanceofObj
    }
  }

  /**
   * 初始化合约构造器
   * @param address 钱包地址
   */
  constructor (address) {
    const web3Instanceof = new Web3(IVYContract.PROVIDER_LIST[0])
    Contract.setProvider(web3Instanceof.eth.givenProvider)
    IVYContract.web3 = web3Instanceof
    IVYContract.walletAddress = address
    // IVY代币
    this.token = new Contract(IVY_ABI, IVYContract.TOKEN_ADDRESS)
    this.token.options.jsonInterface = IVY_ABI
    this.token.options.address = IVYContract.TOKEN_ADDRESS
    this.token.options.from = address
    // 质押合约
    this.contract = new Contract(IVY_ABI, IVYContract.CONTRACT_ADDRESS)
    this.contract.options.jsonInterface = IVY_ABI
    this.contract.options.address = IVYContract.CONTRACT_ADDRESS
    this.contract.options.from = address
  }

  /**
   * 获取余额
   * @param address 钱包地址
   */
  getBalanceInfo (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.token.methods.balanceOf(address).call({
      }).then(res => {
        resolve(Web3.utils.fromWei(res))
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 质押
   * @param address
   */
  pledge ({ address = IVYContract.walletAddress, amount, lock = 0, use = false }) {
    console.log('质押数量', Web3.utils.toWei(amount.toString()))
    const funcSign = IVYContract.web3.eth.abi.encodeFunctionSignature(IVY_ABI_STAKE)
    amount = Web3.utils.toHex(Web3.utils.toWei(amount.toString())).substring(2)
    amount = Web3.utils.padLeft(amount, 64)
    lock = Web3.utils.toHex(Web3.utils.toWei(lock.toString())).substring(2)
    lock = Web3.utils.padLeft(lock, 64)
    use = Web3.utils.toHex(Web3.utils.toWei('0')).substring(2)
    use = Web3.utils.padLeft(use, 64)
    const data = funcSign + amount + lock + use
    this.sendEtherFrom({ data }).then(res => {
      Toast(i18n.global.t('home.pledgeNumber') + Web3.utils.toWei(amount.toString()))
      console.log('质押成功', res)
    }).catch(e => {
      Toast.fail(e.message)
      console.log('质押失败')
    })
  }

  /**
   * 赎回
   * @param address
   */
  redeem ({ address = IVYContract.walletAddress, amount = 0, depositId = 0, use = false }) {
    console.log('赎回数量', Web3.utils.toWei(amount.toString()))
    const funcSign = IVYContract.web3.eth.abi.encodeFunctionSignature(IVY_ABI_UNSTAKE)
    depositId = Web3.utils.toHex(Web3.utils.toWei(depositId.toString())).substring(2)
    depositId = Web3.utils.padLeft(depositId, 64)
    amount = Web3.utils.toHex(Web3.utils.toWei(amount.toString())).substring(2)
    amount = Web3.utils.padLeft(amount, 64)
    use = Web3.utils.toHex(Web3.utils.toWei('0')).substring(2)
    use = Web3.utils.padLeft(use, 64)
    const data = funcSign + depositId + amount + use
    this.sendEtherFrom({ data }).then(res => {
      console.log('赎回成功', res)
    }).catch(e => {
      Toast.fail(e.message)
      console.log('赎回失败')
    })
  }

  /**
   * 提取挖矿收益
   */
  pickup (use = false) {
    const funcSign = IVYContract.web3.eth.abi.encodeFunctionSignature(IVY_ABI_PROCESS_REWARDS)
    use = Web3.utils.toHex(Web3.utils.toWei('0')).substring(2)
    use = Web3.utils.padLeft(use, 64)
    const data = funcSign + use
    this.sendEtherFrom({ data }).then(res => {
      console.log('提取成功', res)
    }).catch(e => {
      Toast.fail(e.message)
      console.log('提取失败')
    })
  }

  /**
   * 获取质押列表
   */
  getDepositLength (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.contract.methods.getDepositsLength(address).call({
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 获取质押详情
   */
  getDepositDetails ({ id, address = IVYContract.walletAddress }) {
    return new Promise((resolve, reject) => {
      this.contract.methods.getDeposit(address, id).call({
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 获取我的质押量
   * @param address
   */
  getPledgeTotal (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.contract.methods.balanceOf(address).call({
      }).then(res => {
        resolve(Web3.utils.fromWei(res))
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 获取全部用户质押总量
   * @param address
   */
  getPledgeAllTotal (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.contract.methods.poolTokenReserve().call({
      }).then(res => {
        resolve(Web3.utils.fromWei(res))
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 获取挖矿数量
   * @param address
   */
  getMiningNumber (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.contract.methods.pendingYieldRewards(address).call({
      }).then(res => {
        resolve(Web3.utils.fromWei(res))
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 获取挖矿总量
   * @param address
   */
  getMiningTotal (address = IVYContract.walletAddress) {
    return new Promise((resolve, reject) => {
      this.contract.methods.pendingVaultRewards(address).call({
      }).then(res => {
        resolve(Web3.utils.fromWei(res))
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * 计算旷工费
   * @param {Object} address 用户地址
   * @param {Object} data 数据
   * @param {Object} value 转账金额
   */
  getGas ({ data, value = '0x0', from = IVYContract.walletAddress, to = IVYContract.CONTRACT_ADDRESS }) {
    return new Promise((resolve, reject) => {
      // 计算旷工费
      IVYContract.web3.eth.estimateGas({
        from,
        to,
        value,
        data: data
      }).then(gaslimit => {
        IVYContract.web3.eth.getGasPrice().then(gasPrice => {
          resolve({ gaslimit, gasPrice })
        }).catch(e => {
          resolve({ gaslimit })
        })
      }).catch(error => {
        resolve({})
        console.log('矿工费计算失败', error)
      })
    })
  }

  /**
   * 发送交易
   * @param {Object} address 用户地址
   * @param {Object} data 数据
   * @param {Object} value 转账金额
   */
  sendEtherFrom ({ data, value = '0x0', from = IVYContract.walletAddress, to = IVYContract.CONTRACT_ADDRESS }) {
    return new Promise((resolve, reject) => {
      this.getGas({ data, value, from, to }).then(res => {
        const parameters = [{
          from,
          to,
          value,
          data: data,
          gasPrice: res.gasPrice,
          gasLimit: res.gaslimit
        }]
        const payload = {
          method: 'eth_sendTransaction',
          params: parameters,
          from
        }
        window.ethereum.sendAsync(payload, (error, response) => {
          const rejected = 'User denied transaction signature.'
          if (response.error && response.error.message.includes(rejected)) {
            resolve('refuse')
          }
          if (error) {
            reject(error)
          }
          if (response.result) {
            let queryTimes = 0
            const timer = setInterval(() => {
              queryTimes++
              // 查询交易是否完成，这⾥要通过这个⽅法去⼀直查询交易是否完成
              IVYContract.web3.eth.getTransactionReceipt(response.result).then(res => {
                if (res == null) {
                  resolve(res)
                } else if (res.status) {
                  resolve(res.status)
                  clearInterval(timer)
                } else {
                  clearInterval(timer)
                }
              })
              if (queryTimes > 10) {
                clearInterval(timer)
                queryTimes = 0
                reject(new Error('timeout'))
              }
            }, 2000)
          }
        })
        // getGas调用结束
      })
    })
  }
}

export default IVYContract
