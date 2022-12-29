(
    function (){
    //  var  = parseInt(document.getElementById("totalAmount").innerText)
     let total = parseInt(document.getElementById("totalAmount").innerText);
     console.log(total,'33333333333333');
     var elem = document.getElementById("userWallet")
     var userWallet = elem.getAttribute("value")
     console.log(total,userWallet,elem,'uuuuu');
     console.log(typeof(total));
     if (total>userWallet){
        document.getElementById("walletErr").innerText='Wallet Amount Insufficient to make payment'
        document.getElementById("wallet").disabled = true;
        setTimeout("document.getElementById('walletErr').style.display='none';", 3000);
     }
    }
)();