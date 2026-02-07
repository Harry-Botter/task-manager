# Suilog - マルチユーザータスク管理機能 開発仕様書

## プロジェクト概要
Suilog はタスク管理 & Web3貢献度トラッキングシステム。Phase 1 は localStorage ベースの単一ブラウザ環境でマルチユーザー機能を実装。

## 技術スタック
- **Frontend**: React 18 + TypeScript + Vite
- **Web3**: @mysten/dapp-kit + @mysten/sui
- **Storage**: localStorage
- **Network**: Sui Devnet

---

## ✅ Phase 1 実装完了（MVP完成）

**データモデル** ✅
- ✅ `Task.assignedTo?: string | null`
- ✅ `Project.members?: string[]`
- ✅ FilterType: 'myTasks' | 'unassigned' | 'byMember'
- ✅ スキーママイグレーション（既存タスク自動null設定）

**コンポーネント実装** ✅
- ✅ `MemberSelector.tsx` - ドロップダウンUI（truncateAddress適用）
- ✅ `TaskFilterBar.tsx` - All/Today/Pending/InProgress/Completed/MyTasks/Unassigned/ByMember タブ + filterCounts表示 + scrollable dropdown
- ✅ `MemberList.tsx` - メンバー一覧 + アドレス形式チェック（0x + 40hex）+ 重複チェック
- ✅ `TaskForm.tsx` - MemberSelector統合 + 新規作成時currentUserAddressをデフォルト設定
- ✅ `TaskTable.tsx` - 「Assigned To」列（短縮アドレス表示）
- ✅ `TaskEditModal.tsx` - 担当者変更対応
- ✅ `App.tsx` - filterCounts計算 + filterChange ハンドラ（My Tasksウォレット未接続ガード実装）

**ビジネスロジック** ✅
- ✅ フィルター数の正確な計算
- ✅ ウォレット未接続時のMy Tasks無効化
- ✅ アドレス大文字小文字正規化（lowercase比較）
- ✅ メンバーごとのタスク数カウント

---

## 🚧 残タスク（優先度順）

#### 1. **アドレス正規化の統一** 🟡
**状態**: コンポーネント内でばらばら実装
**優先度**: 中 - バグ予防
完了！！

**実装予定**:
```typescript
// src/lib/utils.ts を新規作成
export const normalizeAddress = (addr: string): string => addr.toLowerCase().trim();
export const addressesEqual = (a: string | null, b: string | null): boolean => {
  if (!a || !b) return a === b;
  return normalizeAddress(a) === normalizeAddress(b);
};
```

#### 2. **MemberList バリデーション強化** 🟡
- `0x[0-9a-fA-F]{40}$` 正規表現チェック厳密化
- エラーメッセージUI改善
完了！！

#### 3. **TaskTable 「Assigned To」列確認** 🟡
- truncateAddress正しく適用か
- Unassignedは「-」表示か

---

## 🔮 Phase 2 以降

### Phase 2: チェーン統合
- [ ] `assign_task()` スマートコントラクト
- [ ] フロントエンド トランザクション呼び出し

### Phase 3: Supabase統合
- [ ] リアルタイムSync
- [ ] 複数デバイス対応

### Phase 4: NFT発行（複数メンバー対応）　←今はいらないかも
- [ ] 完了時に全メンバーにNFT発行
- [ ] 貢献度スコア集計

---

## 📝 フロー概要

### タスク作成
ユーザー「+ Add Task」→ TaskFormModal → MemberSelector選択 → 新規作成時currentUserAddress自動設定 → localStorage保存 → 画面更新

### フィルター動作
TaskFilterBar選択 → handleFilterChange() → My Tasks未接続時alert → filterCounts再計算 → getFilteredTasks()絞り込み → レンダリング

---

## 🚨 制限事項

- **複数デバイス非対応**: 各ブラウザが独立した localStorage
- **リアルタイムSync 未実装**: Supabase Phase 4
- **チェーン統合未実装**: トランザクション Phase 2

---

## 🤖 実装ポリシー

- 過度な抽象化禁止（Context / Custom Hooks乱用禁止）
- UI表示は短縮形、state はフルアドレス
- ビジネスロジック → App.tsx に寄せる
- 1コンポーネント = 1責務