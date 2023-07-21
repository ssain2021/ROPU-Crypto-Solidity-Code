//import { web3 } from "../web3.js";
import { cabi, caddress } from "../Common Backend/contractcontants.js";

document.addEventListener("DOMContentLoaded", function() {

    const connectbutton = document.getElementById("connectbutton");
    const vbtbutton = document.getElementById("vbtbutton");
    const cbtbutton = document.getElementById("cbtbutton");
    const ctcbutton = document.getElementById("ctcbutton");
    const bti = document.getElementById("buytaxinput");

    ctcbutton.onclick = connecttoContract;
    connectbutton.onclick = Connect;
    vbtbutton.onclick = viewBuyTax;
    cbtbutton.onclick = function() {
        changeBuyTax(bti.value);
    };

    var contract = null;
    var account;

    function connecttoContract() {
        let provider = window.ethereum;
        provider.request({ method: "eth_requestAccounts" });
        window.web3 = new Web3(provider);
        contract = new window.web3.eth.Contract(cabi, caddress);
        console.log("ContractAddress: " + caddress);
        console.log("Contract: ", contract);
    }

    function Connect() {
        if (typeof window.ethereum !== "undefined") {
            // Metamask is there
            window.ethereum.request({ method: "eth_requestAccounts" }).then(accounts => {
                account = accounts[0];
                console.log("Connected Successfully!: " + account);
                connectbutton.innerText =
                    "Connected: " +
                    account.substring(0, 4) +
                    "....." +
                    account.substring(account.length - 4, account.length);
            });
        } else {
            // Metamask is not there
            alert("First Install Metamask");
            console.log("Metamask is not Installed");
        }
    }

    function viewBuyTax() {
        contract.methods.printBuyTax().call().then(buytax => {
            console.log(buytax);
            document.getElementById("buytaxarea").innerHTML = buytax;
        });
    }

    function changeBuyTax(_buytax) {
        contract.methods.setBuyTax(_buytax).send({ from: account }).then(() => {
                console.log("Successfully Set the Buy Tax to " + _buytax);
            })
            .catch(() => {
                console.error("Error setting Buy Tax" + error);
            });
    }


});