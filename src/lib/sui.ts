import { Transaction } from '@mysten/sui/transactions';
import { Project } from './types';
import { calculateContribution } from './contribution';
import type { Task } from './types';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;

// MVPの固定画像URL
const NFT_IMAGE_URL = 'https://cryptostakenavi.com/wp-content/uploads/2025/07/B02.png';

export interface MintNFTParams {
  project: Project;
  tasks: Task[];
  signAndExecute: any;
  currentAddress: string;
}

/**
 * プロジェクト完了NFTを発行
 */
export async function mintProjectCompletionNFT({
  project,
  tasks,
  signAndExecute,
  currentAddress,
}: MintNFTParams): Promise<string> {
  // アドレス確認
  console.log('🔍 Current Address:', currentAddress);
  console.log('📦 Package ID:', PACKAGE_ID);

  if (!currentAddress) {
    throw new Error('❌ Wallet address is not available');
  }

  if (!PACKAGE_ID) {
    throw new Error('❌ PACKAGE_ID is not set in environment variables');
  }

  try {
    const contribution = calculateContribution(tasks);

    console.log('📊 Contribution Data:', {
      completedTasks: contribution.completedTasks,
      totalEstimatedTime: contribution.totalEstimatedTime,
      totalActualTime: contribution.totalActualTime,
      contributionScore: contribution.contributionScore,
    });

    const tx = new Transaction();

    // 画像URLをバイト配列に変換
    const imageUrlBytes = new TextEncoder().encode(NFT_IMAGE_URL);

    // スマートコントラクト呼び出し
    // ✅ 修正: recipient（受取人アドレス）を第1引数に追加
    tx.moveCall({
      target: `${PACKAGE_ID}::task_bomb::mint_project_completion_proof`,
      arguments: [
        tx.pure.address(currentAddress),                                      // 1. recipient (受取人)
        tx.pure.string(project.name),                                         // 2. project_name
        tx.pure.u32(contribution.completedTasks),                            // 3. completed_tasks
        tx.pure.u32(contribution.totalEstimatedTime),                        // 4. total_estimated_time
        tx.pure.u32(contribution.totalActualTime),                           // 5. total_actual_time
        tx.pure.u64(Date.now()),                                             // 6. completed_at
        tx.pure.u16(Math.min(Math.round(contribution.contributionScore), 65535)), // 7. contribution_score
        tx.pure.vector('u8', Array.from(imageUrlBytes)),                     // 8. image_url
      ],
    });

    console.log('🚀 Sending transaction...');

    // トランザクション実行
    const result = await signAndExecute({
      transaction: tx,
    });

    console.log('✅ Transaction successful:', result.digest);
    return result.digest;
  } catch (error) {
    console.error('❌ NFT Minting Error:', error);
    if (error instanceof Error) {
      throw new Error(`NFT mint failed: ${error.message}`);
    }
    throw new Error('NFT mint failed: Unknown error');
  }
}