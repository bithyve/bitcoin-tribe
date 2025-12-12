import Foundation

class Constants {
    static let shared = Constants()
    
    private init() {}

    let rgbDirName = ".rgb"

    let testnetElectrumUrl = "ssl://electrum.iriswallet.com:50013"
    let testnet4ElectrumUrl = "ssl://electrum.iriswallet.com:50053"
    let regtestElectrumUrl = "electrum.rgbtools.org:50041"
    let mainnetElectrumUrl = "ssl://electrum.iriswallet.com:50003"
    let rgbHttpJsonRpcProtocol = "rgbhttpjsonrpc:"
    let proxyURL = "https://proxy.iriswallet.com/json-rpc"
    let proxyConsignmentEndpoint = "rpcs://proxy.iriswallet.com/0.2/json-rpc"
    let satsForRgb = 9000
    let defaultFeeRate = 58.0
    let backupName = "%@.rgb_backup"

    private var callCount = 0
    private let mainnetUrls = [
        "ssl://electrum.iriswallet.com:50003",
        "https://blockstream.info/api"
    ]
  
    func getMainnetElectrum() -> String {
        let url = mainnetUrls[callCount % mainnetUrls.count]
        callCount += 1
        print(url)
        return url
    }
  
    func getElectrumUrl(network: String) -> String {
        switch network {
        case "TESTNET":
            return testnetElectrumUrl
        case "TESTNET4":
            return testnet4ElectrumUrl
        case "REGTEST":
            return regtestElectrumUrl
        case "MAINNET":
            return getMainnetElectrum()
        default:
            return testnetElectrumUrl
        }
    }
}
