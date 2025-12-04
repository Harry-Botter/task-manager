/*
PackageID: 0xc7e912445b9ceaa24d49dc5bc7e191c588ff77cc272566f47b087ec010884df2
*/

module suilog::task_bomb {
    use std::string::String;
    use sui::url::{Self, Url};
    use sui::event;
    
    // プロジェクト完了証明NFT
    public struct ProjectCompletionProof has key, store {
        id: UID,
        project_name: String,
        completed_tasks: u32,
        total_estimated_time: u32,
        total_actual_time: u32,
        completed_at: u64,
        contribution_score: u16,
        issuer: address,
        image_url: Url,
    }

    // NFT発行イベント
    public struct ProjectCompletionProofMinted has copy, drop {
        proof_id: ID,
        project_name: String,
        contribution_score: u16,
        issuer: address,
    }

    // 証明書NFTを発行
    public fun mint_project_completion_proof(
        recipient: address,
        project_name: String,
        completed_tasks: u32,
        total_estimated_time: u32,
        total_actual_time: u32,
        completed_at: u64,
        contribution_score: u16,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let proof_id = object::new(ctx);
        let id_copy = object::uid_to_inner(&proof_id);

        let proof = ProjectCompletionProof {
            id: proof_id,
            project_name,
            completed_tasks,
            total_estimated_time,
            total_actual_time,
            completed_at,
            contribution_score,
            issuer: sender,
            image_url: url::new_unsafe_from_bytes(image_url),
        };
        //イベント発行
        event::emit(ProjectCompletionProofMinted {
            proof_id: id_copy,
            project_name,
            contribution_score,
            issuer: sender,
        });

        transfer::transfer(proof, recipient);
    }

    /*==ゲッター関数==*/
    // プロジェクト名を取得
    public fun get_project_name(proof: &ProjectCompletionProof): String {
        proof.project_name
    }
    // 完了したタスク数を取得
    public fun get_completed_tasks(proof: &ProjectCompletionProof): u32 {
        proof.completed_tasks
    }
    // 貢献度スコアを取得
    public fun get_contribution_score(proof: &ProjectCompletionProof): u16 {
        proof.contribution_score
    }
    // 発行者アドレスを取得
    public fun get_issuer(proof: &ProjectCompletionProof): address {
        proof.issuer
    }
    // 画像URLを取得
    public fun get_image_url(proof: &ProjectCompletionProof): Url {
        proof.image_url
    }
    // NFT IDを取得
    public fun get_nft_id(proof: &ProjectCompletionProof): ID {
        object::uid_to_inner(&proof.id)
    }

}