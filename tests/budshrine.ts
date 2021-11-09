import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { expect } from 'chai';
import { Budshrine } from '../target/types/budshrine';

const { SystemProgram } = anchor.web3;

describe('budshrine', () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.Provider.env());

	const program = anchor.workspace.Budshrine as Program<Budshrine>;

	const baseAccount = anchor.web3.Keypair.generate();

	it('Starts stuff off with gif count 0!', async () => {
		// Add your test here.
		const tx = await program.rpc.startStuffOf({
			accounts: {
				baseAccount: baseAccount.publicKey,
				user: anchor.getProvider().wallet.publicKey,
				systemProgram: SystemProgram.programId
			},
			signers: [baseAccount]
		});
		console.log('Your transaction signature', tx);

		const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
		expect(account.totalGifs.toNumber()).to.equal(0, 'total_gifs not zero');
	});

	it('Should increment total_gifs when adding gifs and add gif_link to list', async () => {
		const { totalGifs: lastTotalGifs } = await program.account.baseAccount.fetch(
			baseAccount.publicKey
		);

		const GIF_LINK = 'just_a_gif_link';
		await program.rpc.addGif(GIF_LINK, {
			accounts: {
				baseAccount: baseAccount.publicKey
			}
		});

		const { totalGifs: newTotalGifs, gifList } = await program.account.baseAccount.fetch(
			baseAccount.publicKey
		);
		expect(newTotalGifs.toNumber()).to.equal(
			lastTotalGifs.toNumber() + 1,
			'total_gifs did not increment'
		);
		expect(gifList[newTotalGifs.toNumber() - 1].gifLink).to.equal(GIF_LINK);
	});
});
