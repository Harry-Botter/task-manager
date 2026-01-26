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

- ✅ 基本的なタスク管理（CRUD）
- ✅ タスクステータス管理（pending → in-progress → completed）
- ✅ 繰り返しタスク生成（毎週）
- ✅ ローカルストレージ連携
- ✅ WeeklyChart・GanttChart可視化
- ✅ ProjectCompletionProof NFT発行スマートコントラクト
- ✅ ConnectButton・ウォレット接続基盤

---

## 🚧 Phase別実装ロードマップ

### Phase 1: マルチユーザー基盤構築（現在）

**目標**: 単一ブラウザ環境で複数ウォレットをシミュレート

#### 1-1. データモデル拡張
- [-] `Task` 型に `assignedTo: string | null` フィールド追加
- [-] `Project` 型に `members: string[]` フィールド追加
- [-] `assignedTo` のスキーマ移行（既存タスクにnull設定）

#### 1-2. コンポーネント新規実装

**MemberSelector.tsx** 
- [-] ドロップダウンコンポーネント
- [-] 短縮アドレス表示（0x1234...5678）
- [-] Unassigned オプション
- [-] onChange コールバック

**TaskFilterBar.tsx**
- [-] タブベースのフィルターUI
- [-] フィルター種類: All Tasks / My Tasks / Unassigned / By Member
- [-] 各フィルターのタスク数表示
- [-] 現在のフィルターのハイライト

**MemberList.tsx**（Sidebar内に統合）👈今ここ！！
- [-] メンバー一覧表示
- [-] 各メンバーのタスク数カウント
- [-] メンバー追加フォーム（アドレス入力）

#### 1-3. 既存コンポーネント修正

**TaskForm.tsx**
- [ ] `MemberSelector` を担当者選択フィールドとして統合
- [ ] フォーム送信時に `assignedTo` を設定

**TaskTable.tsx**
- [ ] 新しい列「Assigned To」を追加
- [ ] 担当者名を短縮アドレスで表示
- [ ] Unassigned タスクには「-」表示

**TaskEditModal.tsx**
- [ ] 担当者変更機能を追加
- [ ] 担当者変更検知ロジック

**App.tsx**
- [ ] `TaskFilterBar` を TaskTable 上部に配置
- [ ] フィルター状態を管理
- [ ] `getFilteredTasks()` ロジック実装

#### 1-4. ローカルストレージ改善
- [ ] ユーザーごとのプロジェクト分離キー（wallet address）
- [ ] 同じブラウザで複数ウォレット切り替えテスト対応
- [ ] データ永続化確認

---

### Phase 2: タスク割り当てトランザクション統合（Next）

**スマートコントラクト修正**
- [ ] `assign_task()` 関数実装
  - パラメータ: `project_id`, `task_id`, `assigned_to: address`, `assigned_by: address`
  - イベント: `TaskAssigned`
  
**フロントエンド統合**
- [ ] タスク作成時に `assign_task()` トランザクション発行
- [ ] 担当者変更時に `assign_task()` トランザクション発行
- [ ] トランザクション成功/失敗ハンドリング
- [ ] Loading状態UI表示
- [ ] エラーメッセージ表示

---

### Phase 3: NFT発行フロー完成（Future）

**マルチメンバーNFT発行**
- [ ] プロジェクト完了時、メンバーごとに `mint_personal_completion_proof()` 呼び出し
- [ ] 各メンバーの貢献度スコア集計
- [ ] バッチトランザクション実行
- [ ] NFT Gallery表示

---

### Phase 4: Supabase統合（Future）

- [ ] Supabase Auth + RLS設定
- [ ] projects, tasks, members テーブル作成
- [ ] リアルタイムSync実装
- [ ] 複数ブラウザ・複数デバイス対応

---

## 🎯 Phase 1 詳細仕様

### 1. マルチユーザー対応

#### ユーザー識別
- Suiウォレットアドレスで識別
- 役割(Role)による権限分離は**しない**（全員が平等）
- 全メンバーが全タスクの作成・編集・削除・割り当て変更が可能

#### プロジェクト構造
- 1プロジェクトに複数メンバーが参加
- 全員が全メンバーのタスクを閲覧可能
- メンバー追加はウォレットアドレスで行う（手動入力）
- **Phase 1制限**: 同一ブラウザ内での複数ウォレット切り替えのみ対応

---

### 2. タスク担当者機能

#### タスク割り当てルール

1. タスク作成時に担当者を指定可能（未割り当ても可）
2. タスク編集画面で誰でも担当者を変更可能
3. **Phase 1**: 担当者変更は localStorage のみ更新（スマートコントラクト統合は Phase 2）
4. `assignedTo`が`null`の場合は「Unassigned」（バックログ）

---

### 3. フィルター機能

#### フィルター種類

- **All Tasks**: 全タスク表示
- **My Tasks**: 現在接続中のウォレットアドレスが `assignedTo` に等しいタスク
- **Unassigned**: `assignedTo === null` のタスク
- **By Member**: ドロップダウンでメンバーを選択してフィルター

#### UI配置

- `TaskTable` の上部に `TaskFilterBar` コンポーネントを配置
- フィルター状態は React state で管理
- 複数フィルターの同時適用は未対応（1つのみ選択可能）

#### フィルター時のタスク数表示

```
All Tasks (12) | My Tasks (5) | Unassigned (3) | By Member ▼
```

---

## 🎨 UI/UXコンポーネント設計

### 新規コンポーネント

#### 1. `MemberSelector.tsx`

**目的**: タスクフォームで担当者を選択

**Props**:
```typescript
interface MemberSelectorProps {
  members: string[]; // ウォレットアドレスの配列
  value: string | null; // 現在の選択値
  onChange: (address: string | null) => void;
  allowUnassigned?: boolean; // デフォルト: true
}
```

**実装ポイント**:
- ドロップダウンで表示
- アドレスは短縮形（`0x1234...5678`）で表示
- `allowUnassigned`が`true`の場合、「Unassigned」オプションを表示
- 選択時に`onChange`コールバックを実行

---

#### 2. `TaskFilterBar.tsx`

**目的**: タスク一覧のフィルター機能

**Props**:
```typescript
interface TaskFilterBarProps {
  currentFilter: 'all' | 'myTasks' | 'unassigned' | 'byMember';
  members: string[];
  selectedMember?: string | null;
  filterCounts: {
    all: number;
    myTasks: number;
    unassigned: number;
    [key: string]: number; // By Member の各メンバーのカウント
  };
  onFilterChange: (filter: 'all' | 'myTasks' | 'unassigned' | 'byMember', member?: string) => void;
}
```

**実装ポイント**:
- タブベースの実装
- 各フィルターのタスク数を表示（例: My Tasks (5)）
- 現在のフィルターをハイライト表示
- By Member 選択時はドロップダウン表示

---

#### 3. `MemberList.tsx`（Sidebar に統合）

**目的**: プロジェクトメンバー一覧と各メンバーのタスク数を表示

**Props**:
```typescript
interface MemberListProps {
  members: string[];
  tasks: Task[];
  onAddMember: (address: string) => void;
  currentUserAddress?: string;
}
```

**表示内容**:
```
👥 Members (3)
  • 0x1234...5678 (5 tasks) ← you
  • 0xabcd...ef01 (3 tasks)
  • 0x9876...4321 (2 tasks)

[+ Add Member] (入力フォーム)
```

---

### 既存コンポーネントの修正

#### `TaskForm.tsx` の変更
**担当者選択UI の追加**:
```typescript
<MemberSelector
  members={members}
  value={assignedTo}
  onChange={setAssignedTo}
  allowUnassigned={true}
/>
```

**保存時の処理**:
```typescript
const newTask = {
  ...task,
  assignedTo, // null または address
};
```

---

#### `TaskTable.tsx` の変更

**新しい列を追加**:
- 列名: "Assigned To"
- 内容: 短縮アドレスまたは「-」（Unassigned）
- 幅: 120px

```typescript
{
  header: 'Assigned To',
  cell: (task) => task.assignedTo ? truncateAddress(task.assignedTo) : '-',
  width: '120px',
}
```

---

#### `App.tsx` の変更

**Project初期化**:
```typescript
const [project, setProject] = useState<Project>(() => {
  const stored = storage.getProject();
  return {
    ...stored,
    members: stored.members || [],
  };
});
```

**フィルター機能**:
```typescript
type FilterType = 'all' | 'myTasks' | 'unassigned' | 'byMember';
const [filter, setFilter] = useState<FilterType>('all');
const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);

const getFilteredTasks = () => {
  let filtered = tasks;
  
  if (filter === 'myTasks') {
    filtered = tasks.filter(t => t.assignedTo === account?.address);
  } else if (filter === 'unassigned') {
    filtered = tasks.filter(t => t.assignedTo === null);
  } else if (filter === 'byMember' && selectedMemberFilter) {
    filtered = tasks.filter(t => t.assignedTo === selectedMemberFilter);
  }
  
  return filtered;
};
```

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

## 📝 実装チェックリスト（Phase 1）

- [-] `Task` 型に `assignedTo: string | null` 追加
- [-] `Project` 型に `members: string[]` 追加
- [ ] localStorage のマイグレーション処理
- [-] `MemberSelector.tsx` 実装
- [ ] `TaskFilterBar.tsx` 実装
- [-] `MemberList.tsx` 実装
- [ ] `TaskForm.tsx` に MemberSelector 統合
- [ ] `TaskEditModal.tsx` で担当者変更対応
- [ ] `TaskTable.tsx` に「Assigned To」列追加
- [ ] `App.tsx` にフィルターロジック実装
- [ ] ウォレット切り替え動作確認テスト
- [ ] UI/UX レビュー

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