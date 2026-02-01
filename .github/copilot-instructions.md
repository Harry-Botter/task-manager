# Suilog - マルチユーザータスク管理機能 開発仕様書

## プロジェクト概要
Suilog（タスク管理 & Web3貢献度トラッカー）に、複数人でのタスク管理機能を追加する。

## 技術スタック
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Web3**: @mysten/dapp-kit + @mysten/sui
- **Storage**: localStorage (Phase 1) → Supabase (Phase 4)
- **Smart Contract**: Move (Sui blockchain)
- **Network**: Sui Devnet
- **Deploy**: Vercel

---

## ✅ 実装済み機能

### Phase 1: マルチユーザー基盤構築（UI 大幅修正完了）

**データモデル拡張** ✅
- ✅ `Task` 型に `assignedTo: string | null` フィールド追加
- ✅ `Project` 型に `members: string[]` フィールド追加
- ✅ スキーマ移行処理（既存タスクに null 設定）

**コンポーネント新規実装** ✅
- ✅ `MemberSelector.tsx` - 担当者選択ドロップダウン
- ✅ `TaskFilterBar.tsx` - タブベースフィルター UI
- ✅ `MemberList.tsx` - メンバー一覧表示 + 追加フォーム

**既存コンポーネント修正** ✅
- ✅ `TaskForm.tsx` - MemberSelector 統合
- ✅ `TaskTable.tsx` - 「Assigned To」列追加
- ✅ `TaskEditModal.tsx` - 担当者変更検知
- ✅ `App.tsx` - TaskFilterBar 統合

---

## 🚧 MVP 完成のための残タスク（優先度順）

### 🔴 Phase 1-Final: MVP 完成（現在ここ！）

#### 1. **App.tsx フィルター計算ロジック** 🚨 Critical
**状態**: 不完全

**必要な実装**:
```typescript
// src/App.tsx の getFilteredTasks() に追加

// フィルター数を計算する関数（タスク表示の上に使用）
const calculateFilterCounts = () => {
  const normalizedCurrentAddress = account?.address?.toLowerCase();
  
  return {
    all: tasks.length,
    myTasks: tasks.filter(t => 
      t.assignedTo?.toLowerCase() === normalizedCurrentAddress
    ).length,
    unassigned: tasks.filter(t => t.assignedTo === null).length,
    byMember: selectedMemberFilter 
      ? tasks.filter(t => 
          t.assignedTo?.toLowerCase() === selectedMemberFilter.toLowerCase()
        ).length
      : 0,
  };
};

const filterCounts = calculateFilterCounts();
```

**UI 渡し先**: `<TaskFilterBar ... filterCounts={filterCounts} />`

**テスト方法**:
- All Tasks に「12」と表示されるか確認
- My Tasks にフィルターしたときに正しい数が出るか確認
- Unassigned に 0 または 1 以上が出るか確認

---

#### 2. **ウォレット未接続時の My Tasks 防御** 🚨 Critical
**状態**: 現在の問題で自動フィルター適用時に `account === undefined` で暴走

**必要な実装**:
```typescript
// src/App.tsx の handleFilterChange() 内

const handleFilterChange = (newFilter: FilterType, selectedMember?: string | null) => {
  // My Tasks は未接続時は無効化
  if (newFilter === 'myTasks' && !account?.address) {
    alert('⚠️ Please connect your wallet to use "My Tasks" filter');
    setFilter('all');
    return;
  }
  
  setFilter(newFilter);
  if (newFilter === 'byMember' && selectedMember) {
    setSelectedMemberFilter(selectedMember);
  }
};
```

**UI 表示**: TaskFilterBar で「My Tasks」を disabled 表示

```typescript
// src/components/TaskFilterBar.tsx のボタンに

disabled={!currentUserAddress}
style={{
  opacity: !currentUserAddress ? 0.5 : 1,
  cursor: !currentUserAddress ? 'not-allowed' : 'pointer',
  ...otherStyles
}}
```

---

#### 3. **MemberSelector / TaskFilterBar のアドレス正規化** 🚨 Critical
**状態**: 「0xABCD」vs「0xabcd」の比較でバグる可能性

**必要な実装**:
```typescript
// src/lib/utils.ts（新規作成）

export const normalizeAddress = (address: string): string => {
  return address.toLowerCase().trim();
};

export const truncateAddress = (address: string): string => {
  const normalized = normalizeAddress(address);
  if (!normalized || normalized.length < 10) return normalized;
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
};

export const addressesEqual = (addr1: string | null, addr2: string | null): boolean => {
  if (!addr1 || !addr2) return addr1 === addr2;
  return normalizeAddress(addr1) === normalizeAddress(addr2);
};
```

**使用箇所**:
```typescript
// App.tsx, TaskFilterBar.tsx, MemberSelector.tsx で
import { normalizeAddress, addressesEqual } from '../lib/utils';

// 比較時は常に normalizeAddress を使用
if (normalizeAddress(t.assignedTo) === normalizeAddress(currentUserAddress)) { ... }
```

---

#### 4. **TaskFormModal の currentUserAddress 自動設定** 🟡 Important
**状態**: 新規タスク作成時に担当者が空白

**必要な実装**:
```typescript
// src/components/TaskForm.tsx の useEffect に追加

useEffect(() => {
  if (editingTask) {
    // 編集モード: 既存の assignedTo を保持
    setAssignedTo(editingTask.assignedTo ?? null);
  } else if (currentUserAddress) {
    // 新規作成モード: 現在のウォレットをデフォルト設定
    setAssignedTo(currentUserAddress);
  }
}, [editingTask, currentUserAddress]);
```

**テスト方法**:
1. ウォレット接続
2. 「+ Add Task」をクリック
3. MemberSelector が自分のアドレスで事前選択されているか確認

---

#### 5. **MemberList 入力検証** 🟡 Important
**状態**: アドレス形式のチェックなし、重複チェックなし

**必要な実装**:
```typescript
// src/components/MemberList.tsx の handleAddMember() 内

const handleAddMember = (address: string) => {
  const trimmed = address.trim();
  
  // 1. 形式チェック
  if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
    alert('❌ Invalid address format. Expected: 0x + 40 hex characters');
    return;
  }
  
  // 2. 16進数チェック
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    alert('❌ Invalid address. Must contain only hex characters (0-9, a-f)');
    return;
  }
  
  // 3. 重複チェック
  const normalized = trimmed.toLowerCase();
  if (members.some(m => m.toLowerCase() === normalized)) {
    alert('⚠️ This member is already in the project');
    return;
  }
  
  // OK: 追加処理
  onAddMember(trimmed);
  setInputValue(''); // 入力フォームをクリア
};
```

---

#### 6. **By Member フィルターの UI スクロール対応** 🟡 Important
**状態**: メンバーが多いとドロップダウンが画面を超える

**必要な実装**:
```typescript
// src/components/TaskFilterBar.tsx のドロップダウン内

{isDropdownOpen && (
  <div style={{
    position: 'absolute',
    zIndex: 50,
    top: 'calc(100% + 0.5rem)',
    left: 0,
    minWidth: '240px',
    maxHeight: '300px',  // ← 追加
    overflowY: 'auto',   // ← 追加
    background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
    // ...他のスタイル
  }}>
```

---

### 🟢 テスト方法（MVP 完成確認）

#### シナリオ 1: フィルター表示動作確認
```
1. ウォレット接続（例: User A）
2.「All Tasks」タブ → 全タスク数が表示される
3. 「My Tasks」タブ → User A に割り当てたタスクのみ表示
4. 「Unassigned」タブ → assignedTo === null のタスクのみ表示
5. 「By Member」ドロップダウン → User B を選択 → User B のタスク表// filepath: /Users/kawakuboyukhiro/開発/Suilog/.github/copilot-instructions.md

# Suilog - マルチユーザータスク管理機能 開発仕様書

## プロジェクト概要
Suilog（タスク管理 & Web3貢献度トラッカー）に、複数人でのタスク管理機能を追加する。

## 技術スタック
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Web3**: @mysten/dapp-kit + @mysten/sui
- **Storage**: localStorage (Phase 1) → Supabase (Phase 4)
- **Smart Contract**: Move (Sui blockchain)
- **Network**: Sui Devnet
- **Deploy**: Vercel

---

## ✅ 実装済み機能

### Phase 1: マルチユーザー基盤構築（UI 大幅修正完了）

**データモデル拡張** ✅
- ✅ `Task` 型に `assignedTo: string | null` フィールド追加
- ✅ `Project` 型に `members: string[]` フィールド追加
- ✅ スキーマ移行処理（既存タスクに null 設定）

**コンポーネント新規実装** ✅
- ✅ `MemberSelector.tsx` - 担当者選択ドロップダウン
- ✅ `TaskFilterBar.tsx` - タブベースフィルター UI
- ✅ `MemberList.tsx` - メンバー一覧表示 + 追加フォーム

**既存コンポーネント修正** ✅
- ✅ `TaskForm.tsx` - MemberSelector 統合
- ✅ `TaskTable.tsx` - 「Assigned To」列追加
- ✅ `TaskEditModal.tsx` - 担当者変更検知
- ✅ `App.tsx` - TaskFilterBar 統合

---

## 🚧 MVP 完成のための残タスク（優先度順）

### 🔴 Phase 1-Final: MVP 完成（現在ここ！）

#### 1. **App.tsx フィルター計算ロジック** 🚨 Critical
**状態**: 不完全

**必要な実装**:
```typescript
// src/App.tsx の getFilteredTasks() に追加

// フィルター数を計算する関数（タスク表示の上に使用）
const calculateFilterCounts = () => {
  const normalizedCurrentAddress = account?.address?.toLowerCase();
  
  return {
    all: tasks.length,
    myTasks: tasks.filter(t => 
      t.assignedTo?.toLowerCase() === normalizedCurrentAddress
    ).length,
    unassigned: tasks.filter(t => t.assignedTo === null).length,
    byMember: selectedMemberFilter 
      ? tasks.filter(t => 
          t.assignedTo?.toLowerCase() === selectedMemberFilter.toLowerCase()
        ).length
      : 0,
  };
};

const filterCounts = calculateFilterCounts();
```

**UI 渡し先**: `<TaskFilterBar ... filterCounts={filterCounts} />`

**テスト方法**:
- All Tasks に「12」と表示されるか確認
- My Tasks にフィルターしたときに正しい数が出るか確認
- Unassigned に 0 または 1 以上が出るか確認

---

#### 2. **ウォレット未接続時の My Tasks 防御** 🚨 Critical
**状態**: 現在の問題で自動フィルター適用時に `account === undefined` で暴走

**必要な実装**:
```typescript
// src/App.tsx の handleFilterChange() 内

const handleFilterChange = (newFilter: FilterType, selectedMember?: string | null) => {
  // My Tasks は未接続時は無効化
  if (newFilter === 'myTasks' && !account?.address) {
    alert('⚠️ Please connect your wallet to use "My Tasks" filter');
    setFilter('all');
    return;
  }
  
  setFilter(newFilter);
  if (newFilter === 'byMember' && selectedMember) {
    setSelectedMemberFilter(selectedMember);
  }
};
```

**UI 表示**: TaskFilterBar で「My Tasks」を disabled 表示

```typescript
// src/components/TaskFilterBar.tsx のボタンに

disabled={!currentUserAddress}
style={{
  opacity: !currentUserAddress ? 0.5 : 1,
  cursor: !currentUserAddress ? 'not-allowed' : 'pointer',
  ...otherStyles
}}
```

---

#### 3. **MemberSelector / TaskFilterBar のアドレス正規化** 🚨 Critical
**状態**: 「0xABCD」vs「0xabcd」の比較でバグる可能性

**必要な実装**:
```typescript
// src/lib/utils.ts（新規作成）

export const normalizeAddress = (address: string): string => {
  return address.toLowerCase().trim();
};

export const truncateAddress = (address: string): string => {
  const normalized = normalizeAddress(address);
  if (!normalized || normalized.length < 10) return normalized;
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
};

export const addressesEqual = (addr1: string | null, addr2: string | null): boolean => {
  if (!addr1 || !addr2) return addr1 === addr2;
  return normalizeAddress(addr1) === normalizeAddress(addr2);
};
```

**使用箇所**:
```typescript
// App.tsx, TaskFilterBar.tsx, MemberSelector.tsx で
import { normalizeAddress, addressesEqual } from '../lib/utils';

// 比較時は常に normalizeAddress を使用
if (normalizeAddress(t.assignedTo) === normalizeAddress(currentUserAddress)) { ... }
```

---

#### 4. **TaskFormModal の currentUserAddress 自動設定** 🟡 Important
**状態**: 新規タスク作成時に担当者が空白

**必要な実装**:
```typescript
// src/components/TaskForm.tsx の useEffect に追加

useEffect(() => {
  if (editingTask) {
    // 編集モード: 既存の assignedTo を保持
    setAssignedTo(editingTask.assignedTo ?? null);
  } else if (currentUserAddress) {
    // 新規作成モード: 現在のウォレットをデフォルト設定
    setAssignedTo(currentUserAddress);
  }
}, [editingTask, currentUserAddress]);
```

**テスト方法**:
1. ウォレット接続
2. 「+ Add Task」をクリック
3. MemberSelector が自分のアドレスで事前選択されているか確認

---

#### 5. **MemberList 入力検証** 🟡 Important
**状態**: アドレス形式のチェックなし、重複チェックなし

**必要な実装**:
```typescript
// src/components/MemberList.tsx の handleAddMember() 内

const handleAddMember = (address: string) => {
  const trimmed = address.trim();
  
  // 1. 形式チェック
  if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
    alert('❌ Invalid address format. Expected: 0x + 40 hex characters');
    return;
  }
  
  // 2. 16進数チェック
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    alert('❌ Invalid address. Must contain only hex characters (0-9, a-f)');
    return;
  }
  
  // 3. 重複チェック
  const normalized = trimmed.toLowerCase();
  if (members.some(m => m.toLowerCase() === normalized)) {
    alert('⚠️ This member is already in the project');
    return;
  }
  
  // OK: 追加処理
  onAddMember(trimmed);
  setInputValue(''); // 入力フォームをクリア
};
```

---

#### 6. **By Member フィルターの UI スクロール対応** 🟡 Important
**状態**: メンバーが多いとドロップダウンが画面を超える

**必要な実装**:
```typescript
// src/components/TaskFilterBar.tsx のドロップダウン内

{isDropdownOpen && (
  <div style={{
    position: 'absolute',
    zIndex: 50,
    top: 'calc(100% + 0.5rem)',
    left: 0,
    minWidth: '240px',
    maxHeight: '300px',  // ← 追加
    overflowY: 'auto',   // ← 追加
    background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
    // ...他のスタイル
  }}>
```

---

### 🟢 テスト方法（MVP 完成確認）

#### シナリオ 1: フィルター表示動作確認
```
1. ウォレット接続（例: User A）
2.「All Tasks」タブ → 全タスク数が表示される
3. 「My Tasks」タブ → User A に割り当てたタスクのみ表示
4. 「Unassigned」タブ → assignedTo === null のタスクのみ表示
5. 「By Member」ドロップダウン → User B を選択 → User B のタスク表


---

## 📊 データフロー

### タスク作成フロー（Phase 1）

```
1. ユーザーが「+ Add Task」をクリック
2. TaskFormModal が開く
3. タスク情報を入力
4. MemberSelector で担当者を選択
5. 「Create Task」をクリック
6. タスクを localStorage に保存
7. assignedTo が設定されている場合:
   → UI上でタスクを表示
   → 担当者情報を反映
8. フィルターUI を更新
```

### タスク編集（担当者変更）フロー（Phase 1）

```
1. ユーザーが既存タスクの「Edit」をクリック
2. TaskEditModal が開く（現在の assignedTo を表示）
3. MemberSelector で新しい担当者を選択
4. 「Save Changes」をクリック
5. 担当者が変更されたか判定
6. localStorage を更新
7. UI を再レンダリング
```

### タスク割り当てトランザクション（Phase 2 - Future）

```
1. タスク作成または編集時に assignedTo が設定
2. フロントエンド → assign_task() トランザクション呼び出し
3. ウォレットで署名・承認
4. チェーン上に記録
5. イベント: TaskAssigned 発行
6. トランザクション確認後、UI 更新
```

### NFT発行フロー（既実装、マルチメンバー対応は Phase 3）

```
1. プロジェクトが completed ステータス
2. CompleteProjectButton クリック
3. 現在の wallet が NFT 受け取る
4. ProjectCompletionProof NFT 発行
5. トランザクションダイジェスト取得
6. project.nftMinted = true
7. project.nftObjectId = digest
```

---

## 🚨 重要な注意点

### Phase 1 の制限事項

- **複数人リアルタイム共有不可**: 各ブラウザが独立した localStorage を使用
  - **テスト方法**: 同じブラウザで ウォレット A → 切断 → ウォレット B に切り替え
  - → それぞれ独立したタスク一覧を表示（想定動作）
  
- **ウォレット切り替え時のデータ**: 
  - localStorage キーを wallet address で分離
  - 切り替え後、そのウォレットのデータのみ読み込み

### ウォレットアドレス表示

- **短縮形**: `0x1234...5678`（前4文字 + ... + 後4文字）
- **フルアドレス**: ツールチップまたはコピーボタンで表示
- **ユーティリティ関数**: `truncateAddress(address: string): string`

### トランザクションエラーハンドリング（Phase 2）

- ユーザーがトランザクションを拒否した場合 → エラーメッセージ表示、localStorage 更新なし
- ガス不足の場合 → 「Insufficient gas」メッセージ
- ネットワークエラーの場合 → リトライオプション提供

### NFT画像URL

- MVP段階では固定URL使用: `https://cryptostakenavi.com/wp-content/uploads/2025/07/B02.png`
- 将来的には個人ごとにカスタマイズ可能に

---

## 🤖 GitHub Copilot / AI 実装ガイドライン（重要）

このリポジトリでは、AI（GitHub Copilot / ChatGPT 等）を実装補助として使用する。
以下の方針を**常に最優先**とすること。

### 基本思想

- **Phase 1 は「シミュレーション」**
  - localStorage 前提
  - マルチユーザーは「同一ブラウザ内ウォレット切り替え」で再現
  - リアルタイム同期・分散合意は一切考慮しない

- **管理コスト最小化が最重要**
  - 自動化できることは自動化
  - 人的オペレーションを前提にしない設計
  - ロジックは単純・明示的・追いやすく

### 実装ポリシー

- 過剰な抽象化は禁止
  - Context / Custom Hooks の乱用禁止
  - YAGNI（You Aren’t Gonna Need It）を厳守

- UIよりもデータフローを優先
  - 見た目は最低限でよい
  - 正しい state 更新と再レンダリングを重視

- 1コンポーネント = 1責務
  - MemberSelector は「選択UI」だけを担当
  - ビジネスロジックは App.tsx 側に寄せる

### アドレス表記ルール

- UI表示は必ず短縮形
  - `0x1234...5678`
- フルアドレスは state / storage のみで扱う
- 表示用ユーティリティは共通化してもよいが、
  Phase 1 ではコンポーネント内実装も許可する

### 禁止事項（Phase 1）

- Supabase / API / RPC 呼び出し
- Move コントラクト前提の実装
- Role / Permission / Approval フロー
- 同時編集・競合解決ロジック

### AIへの期待値

- 「正しく・愚直に・読みやすく」
- 将来拡張より **今の明快さ**
- 人間が後から読んで即理解できるコード