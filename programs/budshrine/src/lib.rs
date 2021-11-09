use anchor_lang::prelude::*;

declare_id!("Dg3kKZW27NjakKN8Pur7S5PPa19c9o5icoiBXiB7A11h");

#[program]
pub mod budshrine {
    use super::*;

    pub fn start_stuff_of(ctx: Context<StartStuffOff>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_gifs = 0;
        base_account.gif_list = vec![];
        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let key = *base_account.to_account_info().key;
        base_account.gif_list.push(GifItem {
            gif_link: gif_link.to_string(),
            user_address: key,
        });
        base_account.total_gifs += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    #[account(init, payer = user, space = 10240)] // 10240 is max somehow
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct GifItem {
    pub gif_link: String,
    pub user_address: Pubkey,
}

#[account]
pub struct BaseAccount {
    pub total_gifs: u64,
    pub gif_list: Vec<GifItem>,
}
