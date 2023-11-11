import { PoZKerApp } from './PoZKer';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';
let proofsEnabled = false;

describe('PoZKer.js', () => {
  describe('PoZKer()', () => {
    it.todo('should be correct');
  });
});


describe('PoZKer', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: PoZKerApp;

  beforeAll(async () => {
    if (proofsEnabled) await PoZKerApp.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new PoZKerApp(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `PoZKerApp` smart contract', async () => {
    await localDeploy();
    //const num = zkApp.num.get();
    //expect(num).toEqual(Field(1));
  });

  it('correctly updates the num state on the `PoZKerApp` smart contract', async () => {
    await localDeploy();

    // update transaction
    //const txn = await Mina.transaction(senderAccount, () => {
    //  zkApp.update();
    //});
    //await txn.prove();
    //await txn.sign([senderKey]).send();

    //const updatedNum = zkApp.num.get();
    //expect(updatedNum).toEqual(Field(3));
  });
});
