<template>
  <div>
    <div class="rain-container"></div>
    <div class="bg-image"></div>
    <header class="absolute flex items-center w-full top-4 left-0 px-12 py-4">
      <ul class="flex flex-col space-y-10 text-xl font-serif">
        <!-- <li>
          <a
            class="text-4xl underline text-shadow"
            target="_blank"
            href="https://discord.gg/"
          >
            Discord
          </a>
        </li> -->
      
        <li>
          <a
            class="text-4xl underline text-shadow"
            target="_blank"
            href="https://opensea.io/collection/mutant-pixel-hounds"
          >
            OpenSea
          </a>
        </li>
        <li>
          <a
            class="text-4xl underline text-shadow"
            target="_blank"
            href="https://etherscan.io/address/0x30ebfb77e1383a15343dea84376f4cac4e688f2e"
          >
            EtherScan
          </a>
        </li>
      </ul>
    </header>
    <div>
      <div class="container pt-0">
          <div class="flex items-center justify-center flex-col">
              <!-- <img
      class="pt-0 pb-0"
      src="https://crackthecode.mypinata.cloud/ipfs/QmUEV1njChmLpAVQTCnDB5A66ZhbXUMvHuKtpoGBZZxESP"
      width="420"
      alt=""
    /> -->

              <p class="text-8xl pb-6 text-shadow">Mutant Pixel Hounds</p>

              <img class="pt-0 pb-10"
                   src="https://cdn.discordapp.com/attachments/905496996813619201/1055149334435479633/pixelmutanthoundsrotate.gif"
                   width="420"
                   alt="" />

              <p class="text-4xl pb-6 text-shadow text-center">
                  Mutant Hounds bound to the pixel world determined to create destruction and chaos. Created by MAYC and Mutant Hound holders.
              </p>

              <h1 class="font-serif text-8xl mb-6 text-shadow">
                  {{ totalSupply }} / {{ maxSupply }}
              </h1>


             

              <p class="text-black mb-6"></p>

              <form action=""
                    method="POST"
                    class="mb-3"
                    @submit.prevent="mint"
                    v-if="account && isLive && !isSoldOut">
                  <div class="
                relative
                flex
                justify-center
                items-center
                w-full
                pt-1
                pb-2.5
                z-10
              ">
                      <button type="button"
                              class="w-14 pl-2 text-6xl text-shadow"
                              @click="decrease">
                          -
                      </button>
                      <input type="number"
                             min="1"
                             max="10"
                             v-model.number="qty"
                             required
                             class="
                  w-32
                  h-16
                  rounded-md
                  px-2
                  py-2
                  text-6xl text-center
                  font-serif
                  text-yellow text-shadow
                " />
                      <button type="button"
                              class="w-14 pr-2 text-6xl text-shadow"
                              @click="increase">
                          +
                      </button>
                  </div>
                  <button type="submit"
                          class="
                pt-4
                w-full
                underline
                px-14
                py-4s
                rounded-md
                font-serif
                text-6xl text-white text-shadow
              "
                          @click="mint"
                          :disabled="minting">
                      <span v-if="!minting">mint</span>
                      <span v-else>minting...</span>
                  </button>
              </form>

              <h2 class="text-shadow text-5xl mb-3"
                  v-if="account && !isLive && !isSoldOut">
                  not live
              </h2>

              <h2 class="text-shadow mb-3 flex items-center justify-center flex-col"
                  v-if="account && isSoldOut">
                  <p class="text-3xl">sold out</p>
              </h2>

              <button type="button"
                      class="
              px-14
              py-4
              rounded-md
              mb-4
              font-serif
              text-6xl text-white text-shadow
              underline
            "
                      @click="connect"
                      v-if="!account">
                  connect wallet
              </button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

import walletLinkModule from '@web3-onboard/walletlink';
import walletConnectModule from '@web3-onboard/walletconnect';
import torusModule from '@web3-onboard/torus';

import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { ethers } from 'ethers';
import { onMounted, ref } from 'vue';
import useEthers from '@/composables/useEthers.js';

    const ETH_MAINNET_RPC = `https://eth-mainnet.g.alchemy.com/v2/mOZRdBhnC2sNa4bES4sbNovddNjTwl-8`;
const injected = injectedModule();
const walletLink = walletLinkModule();
const torus = torusModule();

const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    mobileLinks: [
      'rainbow',
      'metamask',
      'argent',
      'trust',
      'imtoken',
      'pillar',
    ],
  },
});

const onboard = Onboard({
  wallets: [injected, walletLink, walletConnect, torus],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: ETH_MAINNET_RPC,
    },
  ],
});

const etherPrice = ref(0.001);
const maxSupply = ref(5000);
const maxPerTxPaid = ref(10);
const maxPerTxFree = ref(0);
const numberOfFreeMints = ref(0);

const account = ref(false);
const totalSupply = ref('-');
const qty = ref(1);

const minting = ref(false);
const isLive = ref(false);
const isSoldOut = ref(false);
const isFreeMint = ref(false);

let provider = ref(null);
let signer = ref(null);

const { contractAddress, abi } = useEthers;
let contract = ref(null);

onMounted(async () => {
  try {
    const eth_provider = await detectEthereumProvider();
    provider = new ethers.providers.Web3Provider(eth_provider);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
  } catch (err) {
    console.error(err);
  }
});

const updateState = async () => {
  totalSupply.value = (await contract.totalSupply()).toNumber();
  if (totalSupply.value >= maxSupply.value) {
    isSoldOut.value = true;
  }
  if (totalSupply.value < numberOfFreeMints.value) {
    isFreeMint.value = true;
  }
  isLive.value = !(await contract.paused());
  setTimeout(() => updateState(), 1000);
};

const connect = async () => {
  try {
    const wallets = await onboard.connectWallet();
    console.log(wallets);

    if (wallets[0] && wallets[0].accounts[0]) {
      Toastify({
        text: 'wallet connected',
        duration: 5000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#FFF',
          color: '#000',
        },
      }).showToast();

      account.value = wallets[0].accounts[0].address;
      updateState();
    } else {
      Toastify({
        text: 'could not connect',
        duration: 5000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#FFF',
          color: '#000',
        },
      }).showToast();
    }
  } catch (err) {
    Toastify({
      text: err.message,
      duration: 5000,
      gravity: 'top', // `top` or `bottom`
      position: 'center', // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: '#FFF',
        color: '#000',
      },
    }).showToast();
  }
};

const mint = async () => {
  let value = 0;
  minting.value = true;

  try {
    if (
      qty.value > (isFreeMint.value ? maxPerTxFree.value : maxPerTxPaid.value)
    ) {
      Toastify({
        text: 'trying to mint too many',
        duration: 5000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#FFF',
          color: '#000',
        },
      }).showToast();
    } else {
      if (!isFreeMint.value) {
        value = ethers.utils.parseEther(String(etherPrice.value * qty.value));
      }

      const gas = await contract.estimateGas.PublicMint(qty.value, {
        value,
      });

      const tx = await contract.PublicMint(qty.value, {
        gasLimit: gas.mul(115).div(100),
        value,
      });

      Toastify({
        text: 'transaction submitted',
        duration: 5000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#FFF',
          color: '#000',
        },
      }).showToast();

      await tx.wait();

      Toastify({
        text: 'transaction success. check etherscan or opensea',
        duration: 5000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#FFF',
          color: '#000',
        },
      }).showToast();
    }
  } catch (err) {
    const message =
      err.error?.message.replace('execution reverted: ', '') || err.message;

    Toastify({
      text: message,
      duration: 5000,
      gravity: 'top', // `top` or `bottom`
      position: 'center', // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: '#FFF',
        color: '#000',
      },
    }).showToast();
  }

  minting.value = false;
};

const decrease = () => {
  if (qty.value > 1) {
    qty.value--;
  }
};

const increase = () => {
  if (
    qty.value < (isFreeMint.value ? maxPerTxFree.value : maxPerTxPaid.value)
  ) {
    qty.value++;
  }
};
</script>
