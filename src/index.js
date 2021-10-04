import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ethers } from "ethers";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

let tokenAddress = "0xc748673057861a797275CD8A068AbB95A902e8de";
let testUser = "0xd193933337901aca93139fbeafe80dc23a9c392f";
let apiKey = "7UG6HX1VNW76Z8FK2A9B5FTHU9QCQM9W68";
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});


const tokenAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() public view virtual override returns (uint8)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "function totalSupply() external view returns (uint256)",
];

const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
  );

  export const getDecimals = async (tokenAddress) => {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const decimals = await tokenContract.decimals();
    return decimals
  }
  
  export const getTotalSupply = async (tokenAddress) => {
    let decimals = await getDecimals(tokenAddress);
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  
    const supply = await tokenContract.totalSupply()/10**decimals;
   
    return supply; 
  }


export const getCirculatingSupply = async (tokenAddress) => {
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  const deadBal = await tokenContract.balanceOf(
    "0x000000000000000000000000000000000000dead"
  );
  const decimals = await tokenContract.decimals();
  const totalSupply = await tokenContract.totalSupply();

  const deadBal2 = await tokenContract.balanceOf("0x0000000000000000000000000000000000000001");
  const deadBal3 = await tokenContract.balanceOf("0x0000000000000000000000000000000000000000");

  const circulatingSupply = (totalSupply - deadBal - deadBal2 - deadBal3) / 10 ** decimals;


  return  circulatingSupply;
};

  export const getCurrentPrice = async (tokenAddress) => {
    let url = "https://api.pancakeswap.info/api/v2/tokens/" + tokenAddress;
    
  let tokenInfo ='';
    let header = {
      "mode":"cors",
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*'
    }
  
    await fetch(url, header)
    .then(response => response.json())
    .then(res => { tokenInfo = res})
  
  let rawPrice = parseFloat(tokenInfo.data.price)
  return rawPrice.toPrecision(6);
  
  };

  export const getMarketCap = async (price, circulatingSupply) => {

    const MarketCapUsd = price * circulatingSupply;
  
    return formatter.format(MarketCapUsd);
  };
  
export const runMain = async (_tokenAddress) => {
let price= await getCurrentPrice(_tokenAddress);
let circulatingSupply = await getCirculatingSupply(_tokenAddress);
let totalSupply = await getTotalSupply(_tokenAddress);
let marketCap = await getMarketCap(price, circulatingSupply);


 console.log("Price ",price);
 console.log("Total Supply", totalSupply);
 console.log("Circulating Supply", circulatingSupply)
 console.log("MarketCap",marketCap);
 console.log("Top 10k Holders",await topHolders(_tokenAddress));
}


export const topHolders = async (_tokenAddress) => {

    let url = "https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress="+_tokenAddress+"&page=1&offset=10000&apikey="+apiKey;
    
  let tokenHolders ='';
    let header = {
      "mode":"cors",
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin':'*'
    }
  
    await fetch(url, header)
    .then(response => response.json())
    .then(res => { tokenHolders = res})
  
  console.log(tokenHolders.result);
  
return tokenHolders.result;

}


  runMain(tokenAddress);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
