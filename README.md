# zcashd-fullnodejs
Front end GUI for zcashd utilizing node.js, express &amp; axios. Created as a personal project to take advantage of latest ZEC features in zcashd v5.0.0 (Unified Addresses &amp; Orchard shielded pool). Will be adding new features over time.

This is a front end GUI meant to be run on the same machine as zcashd (have not tested using zebra). 

After your zcashd node is fully synced, follow the below steps:

1. git clone https://github.com/KeepBitcoinFree-org/zcashd-fullnodejs.git
2. cd zcashd-fullnodejs/
3. npm install
4. node index rpc_username rpc_password 4-digit-PIN
Example: node index myrpcuser myrpcpassword 1234 

The app will now be reachable at http://localhost:8081 on the localhost, or by using the machine's IP address on the local network. As it is a webapp, it can be access on any device with network access and a web browser.

This is NOT meant to be exposed publicly, as it allows sending from your zcashd wallet. You can however set up a vpn (https://pivpn.io/) to access your network and zcashd fullnodejs GUI from anywhere.

References:

Interaction with zcashd is done using RPC calls with axios - https://zcash.github.io/rpc/, https://axios-http.com/docs/post_example

zcashd Documentation - https://zcash.readthedocs.io/en/latest/rtd_pages/zcashd.html

Setting up zcashd on a Raspberry Pi 4 - https://forum.zcashcommunity.com/t/how-to-run-zcashd-on-raspberry-pi-4-64bit-arm64-raspbian-os/, https://keepbitcoinfree.org/run-a-zcash-node-on-a-raspberry-pi4/

More info about Zcash - https://z.cash/the-basics

Price info is pulled using CoinGecko APIs - https://www.coingecko.com/en/coins/zcash
