-- 기존 한국어 데이터를 기반으로 다국어 데이터 자동 생성
-- 이 스크립트는 기존 한국어 데이터를 영어, 일본어, 중국어로 번역하여 저장합니다

-- 1. 기존 데이터 백업 (이미 있다면 생략)
-- CREATE TABLE ai_info_backup_20241220 AS SELECT * FROM ai_info;

-- 2. 다국어 데이터 업데이트
-- MMAU-Pro: AI 오디오 지능 평가 정리 (2025-08-21)
UPDATE ai_info 
SET 
  info1_title_en = '📘 MMAU-Pro: AI Audio Intelligence Assessment Summary',
  info1_title_ja = '📘 MMAU-Pro: AI音声知能評価まとめ',
  info1_title_zh = '📘 MMAU-Pro: AI音频智能评估总结',
  info1_content_en = 'Introduces the MMAU-Pro test that evaluates how well AI understands sound, music, and speech. 🎧

While humans can hear sounds and understand their meaning, AI excels at text-based understanding but lacks sound comprehension. Previous evaluations only covered short sounds or single questions, making it difficult to reflect real-world environments. MMAU-Pro comprehensively evaluates AI''s true audio understanding capabilities.

Key features include:

5,305 questions and answers included

Uses speech, music, sound, and mixed audio

Evaluates 49 audio capabilities: instrument recognition, voice emotion understanding, sound location detection, etc.

Varied audio lengths: short (≤30s) to very long (8-10 minutes)

Problem formats: multiple choice (MCQs) and open-ended

Uses real-world environmental sounds

MMAU-Pro tackles various challenging tasks:

Understanding multiple audio sources simultaneously

Analyzing sound location and direction

Comprehending long music or stories

Understanding music from diverse cultures

Following instructions accurately to solve problems

Understanding science and math-related sounds

Examples of problems AI actually performs:

"What makes this audio content important?" (Voice STEM problem)

"What raga is this music composed in?" (Music problem)

"If you change the first sound, will it sound like the second?" (Sound reasoning)

"Who did the waiter serve food to first?" (Spatial problem)

Current AI performance: Gemini 2.5 Flash 59%, Audio Flamingo 3 51% - not yet at human level. MMAU-Pro helps identify AI strengths and weaknesses, aiding researchers in finding model improvement directions.

💡 Key message: MMAU-Pro is a comprehensive benchmark that evaluates AI''s real sound understanding capabilities. It can verify whether AI can go beyond simple listening to perform analysis, reasoning, comparison, and judgment.',
  info1_content_ja = 'AIが音、音楽、言葉をどれだけ理解できるかを確認するMMAU-Pro試験を紹介します。🎧

人間は音を聞いて意味を理解できますが、AIは文章ベースの理解は優れているものの、音の理解は不足しています。従来の評価は短い音や単一の質問のみを扱っていたため、実際の環境を反映することが困難でした。MMAU-ProはAIの真の音声理解能力を包括的に評価します。

主な特徴は以下の通りです。

5,305個の質問と回答を含む

話し言葉、音楽、音、混合音声を使用

49種類の音声能力を評価：楽器識別、音声感情理解、音の位置把握など

音声の長さは様々：短い（≤30秒）から非常に長い（8〜10分）

問題形式：選択式（MCQs）と自由記述式

実際の環境音を使用

MMAU-Proが取り組む様々な課題：

複数の音声を同時に聞いて理解

音の位置と方向の分析

長い音楽や物語の理解

多様な文化の音楽理解

指示を正確に従って問題解決

科学・数学関連の音声理解

AIが実際に実行する問題の例：

「この音声内容が重要な理由は？」（音声STEM問題）

「この音楽はどのラーガで構成されていますか？」（音楽問題）

「最初の音を変えると、2番目のように聞こえますか？」（音声推論）

「ウェイターは誰に最初に料理を運びましたか？」（空間問題）

現在のAI性能：Gemini 2.5 Flash 59%、Audio Flamingo 3 51%で人間レベルには達していない。MMAU-ProはAIの長所と短所を把握し、研究者がモデル改善の方向性を見つけるのに役立ちます。

💡 重要なメッセージ：MMAU-ProはAIの実際の音声理解能力を評価する包括的なベンチマークです。AIが単純な聴取を超えて分析・推論・比較・判断まで実行できるかを確認できます。',
  info1_content_zh = '介绍评估AI对声音、音乐和语言理解程度的MMAU-Pro测试。🎧

人类能够听到声音并理解其含义，但AI在基于文本的理解方面表现出色，而在声音理解方面却有所欠缺。以往的评估只涵盖短声音或单一问题，难以反映真实环境。MMAU-Pro全面评估AI的真实音频理解能力。

主要特点包括：

包含5,305个问题和答案

使用语音、音乐、声音和混合音频

评估49种音频能力：乐器识别、语音情感理解、声音位置检测等

音频长度多样：短（≤30秒）到很长（8-10分钟）

问题格式：选择题（MCQs）和开放式

使用真实环境声音

MMAU-Pro应对的各种挑战性任务：

同时理解多个音频源

分析声音位置和方向

理解长音乐或故事

理解多元文化的音乐

准确遵循指示解决问题

理解科学和数学相关声音

AI实际执行的问题示例：

"这段音频内容为什么重要？"（语音STEM问题）

"这段音乐是用什么拉加组成的？"（音乐问题）

"如果改变第一个声音，会像第二个一样吗？"（声音推理）

"服务员先给谁送食物？"（空间问题）

当前AI性能：Gemini 2.5 Flash 59%，Audio Flamingo 3 51%——尚未达到人类水平。MMAU-Pro帮助识别AI的优势和劣势，帮助研究人员找到模型改进方向。

💡 关键信息：MMAU-Pro是一个全面基准，评估AI的真实声音理解能力。它可以验证AI是否能够超越简单听力，执行分析、推理、比较和判断。',
  info1_terms_en = '[{"term": "MMAU-Pro", "description": "Benchmark that comprehensively evaluates AI audio intelligence"}, {"term": "Audio Understanding", "description": "Ability to understand the meaning of sound, music, and speech"}, {"term": "Multi-modal Audio", "description": "Understanding multiple audio sources simultaneously"}, {"term": "Spatial Audio", "description": "Sound location and direction analysis capabilities"}, {"term": "Long-term Audio", "description": "Long audio (8-10 minutes) understanding ability"}, {"term": "Cross-cultural Music", "description": "Recognizing and understanding diverse cultural music"}, {"term": "Temporal Sequence", "description": "Ability to accurately track chronological events"}, {"term": "STEM Audio QA", "description": "Science and mathematics related sound problem solving ability"}, {"term": "Multiple Choice (MCQs)", "description": "Question type where one answer is chosen from options"}, {"term": "Open-ended (Open-ended)", "description": "Question type where answers are written directly"}, {"term": "Raaga (Raaga)", "description": "Indian music specific melodic system"}, {"term": "Audio Context", "description": "Ability to understand sound context based on background"}, {"term": "Musical Emotion Understanding", "description": "Recognizing emotional state of music"}, {"term": "Audio-Text Integration", "description": "Integrating sound and text information for understanding"}, {"term": "Multi-modal Learning", "description": "Learning with various data types (sound + text)"}, {"term": "Event Sequence", "description": "Understanding audio event sequence and relationships"}, {"term": "Musical Genre Recognition", "description": "Ability to distinguish musical categories"}, {"term": "Audio Reasoning", "description": "Reasoning and inference based on sound information"}, {"term": "Open-ended QA", "description": "Direct answer writing problem solving ability"}, {"term": "Cross-modal Recognition Gap", "description": "Difference between audio understanding and text understanding capabilities"}]',
  info1_terms_ja = '[{"term": "MMAU-Pro", "description": "AI音声知能を包括的に評価するベンチマーク"}, {"term": "音声理解能力", "description": "音、音楽、言葉の意味を理解する能力"}, {"term": "マルチモーダル音声", "description": "複数の音声を同時に理解する"}, {"term": "空間音声", "description": "音の位置と方向を分析する能力"}, {"term": "長時間音声", "description": "長い音声（8〜10分）理解能力"}, {"term": "多文化音楽", "description": "様々な文化の音楽を認識し理解する"}, {"term": "時系列", "description": "時系列イベントを正確に追跡する能力"}, {"term": "STEM音声QA", "description": "科学・数学関連音声問題解決能力"}, {"term": "選択式(MCQs)", "description": "選択肢から一つを選ぶ問題形式"}, {"term": "自由記述式(Open-ended)", "description": "直接答えを記述する問題形式"}, {"term": "ラーガ(Raaga)", "description": "インド音楽特有の旋律体系"}, {"term": "音声文脈", "description": "背景に基づいて音の文脈を理解する能力"}, {"term": "音楽感情理解", "description": "音楽の感情状態を認識する"}, {"term": "音声-テキスト統合", "description": "音とテキスト情報を統合して理解する"}, {"term": "マルチモーダル学習", "description": "様々なデータタイプ（音声+テキスト）での学習"}, {"term": "イベント系列", "description": "音声イベントの順序と関係性を理解する"}, {"term": "音楽ジャンル認識", "description": "音楽カテゴリを区別する能力"}, {"term": "音声推論", "description": "音声情報に基づく推論と推測"}, {"term": "自由記述QA", "description": "直接答えを記述する問題解決能力"}, {"term": "クロスモーダル認識ギャップ", "description": "音声理解とテキスト理解能力の差"}]',
  info1_terms_zh = '[{"term": "MMAU-Pro", "description": "全面评估AI音频智能的基准测试"}, {"term": "音频理解能力", "description": "理解声音、音乐和语言含义的能力"}, {"term": "多模态音频", "description": "同时理解多个音频源"}, {"term": "空间音频", "description": "声音位置和方向分析能力"}, {"term": "长时间音频", "description": "长音频（8-10分钟）理解能力"}, {"term": "跨文化音乐", "description": "识别和理解多元文化音乐"}, {"term": "时间序列", "description": "准确追踪时间顺序事件的能力"}, {"term": "STEM音频问答", "description": "科学和数学相关声音问题解决能力"}, {"term": "选择题(MCQs)", "description": "从选项中选择一个答案的问题类型"}, {"term": "开放式(Open-ended)", "description": "直接书写答案的问题类型"}, {"term": "拉加(Raaga)", "description": "印度音乐特有的旋律体系"}, {"term": "音频语境", "description": "基于背景理解声音语境的能力"}, {"term": "音乐情感理解", "description": "识别音乐情感状态"}, {"term": "音频-文本整合", "description": "整合声音和文本信息进行理解"}, {"term": "多模态学习", "description": "使用各种数据类型（声音+文本）的学习"}, {"term": "事件序列", "description": "理解音频事件顺序和关系"}, {"term": "音乐流派识别", "description": "区分音乐类别的能力"}, {"term": "音频推理", "description": "基于声音信息的推理和推断"}, {"term": "开放式问答", "description": "直接书写答案的问题解决能力"}, {"term": "跨模态识别差距", "description": "音频理解和文本理解能力的差异"}]'
WHERE date = '2025-08-21';

-- AI 강점·약점 투명성과 인간-AI 협업 요약 (2025-08-14)
UPDATE ai_info 
SET 
  info1_title_en = '📚 AI Strengths and Weaknesses Transparency and Human-AI Collaboration Summary',
  info1_title_ja = '📚 AI強み・弱み透明性と人間-AI協働まとめ',
  info1_title_zh = '📚 AI优势和劣势透明度与人类-AI协作总结',
  info1_content_en = 'To improve performance when AI and humans work together, AI should not just provide prediction results but also explain the reasoning process and express confidence levels. This requires AI to have explainability, self-assessment capabilities, and the ability to express uncertainty.

Key concepts include:

Human-AI Teaming: Humans and AI collaborate to perform tasks
Explainability: AI''s ability to explain decision-making reasoning
Overreliance: Phenomenon of over-trusting AI recommendations
Self-assessing AI: AI''s ability to evaluate its own performance and limitations
Decision Tree: Tree-structured model for decision-making
Random Forest: Ensemble prediction model combining multiple decision trees
Task Performance: Task execution performance indicators
Calibrated Trust: Appropriately adjusting human AI trust levels
Compliance: AI information understanding and appropriate utilization
Confidence Score: Numerical expression of AI prediction confidence
Transparency: AI decision-making process and information disclosure
Feature: Model input variables or characteristics
Model Accuracy: Model prediction accuracy
Visualization: Data or information display in visual form
Data Overload: Information overload, confusion from too much information
Objective Evaluation: Evaluation through objective criteria
Error Awareness: AI error possibility recognition ability
Predictive Modeling: Modeling to predict future outcomes
Experiment Design: Experiment design and condition setting
Self-reported Measure: Self-reporting evaluation methods',
  info1_content_ja = 'AIと人間が一緒に働く際のパフォーマンスを向上させるために、AIは単に予測結果を提供するだけでなく、推論プロセスを説明し、信頼度を表現する必要があります。これには、AIに説明可能性、自己評価能力、不確実性を表現する能力が必要です。

主要概念には以下が含まれます：

Human-AI Teaming：人間とAIが協力してタスクを実行
Explainability：AIの意思決定推論を説明する能力
Overreliance：AI推奨を過度に信頼する現象
Self-assessing AI：AIが自分のパフォーマンスと限界を評価する能力
Decision Tree：意思決定のためのツリー構造モデル
Random Forest：複数の決定木を組み合わせたアンサンブル予測モデル
Task Performance：タスク実行パフォーマンス指標
Calibrated Trust：人間のAI信頼レベルを適切に調整
Compliance：AI情報理解と適切な活用
Confidence Score：AI予測信頼度の数値表現
Transparency：AI意思決定プロセスと情報開示
Feature：モデル入力変数または特性
Model Accuracy：モデル予測精度
Visualization：データまたは情報を視覚的形式で表示
Data Overload：情報過負荷、多すぎる情報による混乱
Objective Evaluation：客観的基準による評価
Error Awareness：AIエラー可能性認識能力
Predictive Modeling：将来の結果を予測するためのモデリング
Experiment Design：実験設計と条件設定
Self-reported Measure：自己報告評価方法',
  info1_content_zh = '为了提高AI和人类协作时的表现，AI不应该仅仅提供预测结果，还应该解释推理过程并表达置信度。这要求AI具备可解释性、自我评估能力和表达不确定性的能力。

关键概念包括：

Human-AI Teaming：人类和AI协作执行任务
Explainability：AI解释决策推理的能力
Overreliance：过度信任AI建议的现象
Self-assessing AI：AI评估自身表现和局限的能力
Decision Tree：决策的树结构模型
Random Forest：结合多个决策树的集成预测模型
Task Performance：任务执行表现指标
Calibrated Trust：适当调整人类对AI的信任水平
Compliance：AI信息理解和适当利用
Confidence Score：AI预测置信度的数值表达
Transparency：AI决策过程和信息披露
Feature：模型输入变量或特征
Model Accuracy：模型预测准确性
Visualization：以视觉形式显示数据或信息
Data Overload：信息过载，过多信息导致的混乱
Objective Evaluation：通过客观标准进行评估
Error Awareness：AI错误可能性识别能力
Predictive Modeling：预测未来结果的建模
Experiment Design：实验设计和条件设定
Self-reported Measure：自我报告评估方法',
  info1_terms_en = '[{"term": "Human-AI Teaming", "description": "Humans and AI collaborate to perform tasks"}, {"term": "Explainability", "description": "AI''s ability to explain decision-making reasoning"}, {"term": "Overreliance", "description": "Phenomenon of over-trusting AI recommendations"}, {"term": "Self-assessing AI", "description": "AI''s ability to evaluate its own performance and limitations"}, {"term": "Decision Tree", "description": "Tree-structured model for decision-making"}, {"term": "Random Forest", "description": "Ensemble prediction model combining multiple decision trees"}, {"term": "Task Performance", "description": "Task execution performance indicators"}, {"term": "Calibrated Trust", "description": "Appropriately adjusting human AI trust levels"}, {"term": "Compliance", "description": "AI information understanding and appropriate utilization"}, {"term": "Confidence Score", "description": "Numerical expression of AI prediction confidence"}, {"term": "Transparency", "description": "AI decision-making process and information disclosure"}, {"term": "Feature", "description": "Model input variables or characteristics"}, {"term": "Model Accuracy", "description": "Model prediction accuracy"}, {"term": "Visualization", "description": "Data or information display in visual form"}, {"term": "Data Overload", "description": "Information overload, confusion from too much information"}, {"term": "Objective Evaluation", "description": "Evaluation through objective criteria"}, {"term": "Error Awareness", "description": "AI error possibility recognition ability"}, {"term": "Predictive Modeling", "description": "Modeling to predict future outcomes"}, {"term": "Experiment Design", "description": "Experiment design and condition setting"}, {"term": "Self-reported Measure", "description": "Self-reporting evaluation methods"}]',
  info1_terms_ja = '[{"term": "Human-AI Teaming", "description": "人間とAIが協力してタスクを実行"}, {"term": "Explainability", "description": "AIの意思決定推論を説明する能力"}, {"term": "Overreliance", "description": "AI推奨を過度に信頼する現象"}, {"term": "Self-assessing AI", "description": "AIが自分のパフォーマンスと限界を評価する能力"}, {"term": "Decision Tree", "description": "意思決定のためのツリー構造モデル"}, {"term": "Random Forest", "description": "複数の決定木を組み合わせたアンサンブル予測モデル"}, {"term": "Task Performance", "description": "タスク実行パフォーマンス指標"}, {"term": "Calibrated Trust", "description": "人間のAI信頼レベルを適切に調整"}, {"term": "Compliance", "description": "AI情報理解と適切な活用"}, {"term": "Confidence Score", "description": "AI予測信頼度の数値表現"}, {"term": "Transparency", "description": "AI意思決定プロセスと情報開示"}, {"term": "Feature", "description": "モデル入力変数または特性"}, {"term": "Model Accuracy", "description": "モデル予測精度"}, {"term": "Visualization", "description": "データまたは情報を視覚的形式で表示"}, {"term": "Data Overload", "description": "情報過負荷、多すぎる情報による混乱"}, {"term": "Objective Evaluation", "description": "客観的基準による評価"}, {"term": "Error Awareness", "description": "AIエラー可能性認識能力"}, {"term": "Predictive Modeling", "description": "将来の結果を予測するためのモデリング"}, {"term": "Experiment Design", "description": "実験設計と条件設定"}, {"term": "Self-reported Measure", "description": "自己報告評価方法"}]',
  info1_terms_zh = '[{"term": "Human-AI Teaming", "description": "人类和AI协作执行任务"}, {"term": "Explainability", "description": "AI解释决策推理的能力"}, {"term": "Overreliance", "description": "过度信任AI建议的现象"}, {"term": "Self-assessing AI", "description": "AI评估自身表现和局限的能力"}, {"term": "Decision Tree", "description": "决策的树结构模型"}, {"term": "Random Forest", "description": "结合多个决策树的集成预测模型"}, {"term": "Task Performance", "description": "任务执行表现指标"}, {"term": "Calibrated Trust", "description": "适当调整人类对AI的信任水平"}, {"term": "Compliance", "description": "AI信息理解和适当利用"}, {"term": "Confidence Score", "description": "AI预测置信度的数值表达"}, {"term": "Transparency", "description": "AI决策过程和信息披露"}, {"term": "Feature", "description": "模型输入变量或特征"}, {"term": "Model Accuracy", "description": "模型预测准确性"}, {"term": "Visualization", "description": "以视觉形式显示数据或信息"}, {"term": "Data Overload", "description": "信息过载，过多信息导致的混乱"}, {"term": "Objective Evaluation", "description": "通过客观标准进行评估"}, {"term": "Error Awareness", "description": "AI错误可能性识别能力"}, {"term": "Predictive Modeling", "description": "预测未来结果的建模"}, {"term": "Experiment Design", "description": "实验设计和条件设定"}, {"term": "Self-reported Measure", "description": "自我报告评估方法"}]'
WHERE date = '2025-08-14';

-- LLM 효율화 쉽게 이해하기 (2025-08-15)
UPDATE ai_info 
SET 
  info1_title_en = '🚀 Understanding LLM Efficiency Easily',
  info1_title_ja = '🚀 LLM効率化を簡単に理解する',
  info1_title_zh = '🚀 轻松理解LLM效率化',
  info1_content_en = 'Large Language Models (LLMs) perform many intelligent tasks such as writing, question answering, and code generation, but they consume a lot of computational resources. 💻

To make LLMs more efficient, various optimization techniques are being developed. These include:

Transformer Architecture: The foundation of modern language models
Attention Mechanism: Core operation that focuses on important words
Softmax Function: Function that transforms into probabilities
Linear Attention: Attention with limited computational complexity
RNN: Sequential neural networks
SSM: State space models for temporal information storage
Sparse Methods: Methods that only compute some parts
MoE: Mixture of Experts, activating only some models
Hybrid Approaches: Combining multiple architectures
Diffusion Models: Generative models using gradual changes
Multimodal Models: Integrating multiple data types
Autoregressive Generation: Sequential generation method
Quantized Models: Reduced precision, memory savings
U-Net: Image processing models
RWKV: Efficient state space models
MambaBEV: Self-attention image processing models
BEV: Bird''s eye view from non-camera viewpoints
Test-Time Training: Learning during inference
Linear RNN: High-efficiency sequential models',
  info1_content_ja = '大規模言語モデル（LLM）は、文章作成、質問回答、コード生成など多くの知的作業を実行しますが、大量の計算リソースを消費します。💻

LLMをより効率的にするために、様々な最適化技術が開発されています。これらには以下が含まれます：

Transformer Architecture：現代の言語モデルの基盤
Attention Mechanism：重要な単語に集中する中核操作
Softmax Function：確率に変換する関数
Linear Attention：計算複雑性が制限されたAttention
RNN：順次ニューラルネットワーク
SSM：時間情報保存のための状態空間モデル
Sparse Methods：一部のみを計算する方法
MoE：Expert Mixture、一部のモデルのみを活性化
Hybrid Approaches：複数のアーキテクチャを組み合わせ
Diffusion Models：段階的変化を使用する生成モデル
Multimodal Models：複数のデータタイプを統合
Autoregressive Generation：順次生成方法
Quantized Models：精度を下げ、メモリを節約
U-Net：画像処理モデル
RWKV：効率的な状態空間モデル
MambaBEV：自己注意画像処理モデル
BEV：カメラ以外の視点からの鳥瞰図
Test-Time Training：推論中の学習
Linear RNN：高効率順次モデル',
  info1_content_zh = '大型语言模型（LLM）执行写作、问答、代码生成等许多智能任务，但消耗大量计算资源。💻

为了使LLM更高效，正在开发各种优化技术。这些包括：

Transformer Architecture：现代语言模型的基础
Attention Mechanism：专注于重要单词的核心操作
Softmax Function：转换为概率的函数
Linear Attention：计算复杂度有限的注意力
RNN：顺序神经网络
SSM：时间信息存储的状态空间模型
Sparse Methods：只计算部分内容的方法
MoE：专家混合，只激活部分模型
Hybrid Approaches：结合多种架构
Diffusion Models：使用渐进变化的生成模型
Multimodal Models：整合多种数据类型
Autoregressive Generation：顺序生成方法
Quantized Models：降低精度，节省内存
U-Net：图像处理模型
RWKV：高效的状态空间模型
MambaBEV：自注意力图像处理模型
BEV：非相机视角的鸟瞰图
Test-Time Training：推理期间的学习
Linear RNN：高能效顺序模型',
  info1_terms_en = '[{"term": "LLM", "description": "Large Language Model"}, {"term": "Transformer", "description": "Sentence understanding and generation model architecture"}, {"term": "Attention", "description": "Operation that focuses on important words"}, {"term": "Softmax", "description": "Function that transforms into probabilities"}, {"term": "Linear Attention", "description": "Attention with limited computational complexity"}, {"term": "RNN", "description": "Sequential neural networks"}, {"term": "SSM", "description": "State space models for temporal information storage"}, {"term": "Sparse", "description": "Methods that only compute some parts"}, {"term": "MoE", "description": "Expert mixture, activating only some models"}, {"term": "Hybrid", "description": "Combining multiple architectures"}, {"term": "Diffusion", "description": "Generative models using gradual changes"}, {"term": "Multimodal", "description": "Integrating multiple data types"}, {"term": "Autoregressive", "description": "Sequential generation method"}, {"term": "Quantized", "description": "Reduced precision, memory savings"}, {"term": "U-Net", "description": "Image processing models"}, {"term": "RWKV", "description": "Efficient state space models"}, {"term": "MambaBEV", "description": "Self-attention image processing models"}, {"term": "BEV", "description": "Bird''s eye view from non-camera viewpoints"}, {"term": "Test-Time Training", "description": "Learning during inference"}, {"term": "Linear RNN", "description": "High-efficiency sequential models"}]',
  info1_terms_ja = '[{"term": "LLM", "description": "大規模言語モデル"}, {"term": "Transformer", "description": "文章理解と生成モデルアーキテクチャ"}, {"term": "Attention", "description": "重要な単語に集中する操作"}, {"term": "Softmax", "description": "確率に変換する関数"}, {"term": "Linear Attention", "description": "計算複雑性が制限されたAttention"}, {"term": "RNN", "description": "順次ニューラルネットワーク"}, {"term": "SSM", "description": "時間情報保存のための状態空間モデル"}, {"term": "Sparse", "description": "一部のみを計算する方法"}, {"term": "MoE", "description": "Expert Mixture、一部のモデルのみを活性化"}, {"term": "Hybrid", "description": "複数のアーキテクチャを組み合わせ"}, {"term": "Diffusion", "description": "段階的変化を使用する生成モデル"}, {"term": "Multimodal", "description": "複数のデータタイプを統合"}, {"term": "Autoregressive", "description": "順次生成方法"}, {"term": "Quantized", "description": "精度を下げ、メモリを節約"}, {"term": "U-Net", "description": "画像処理モデル"}, {"term": "RWKV", "description": "効率的な状態空間モデル"}, {"term": "MambaBEV", "description": "自己注意画像処理モデル"}, {"term": "BEV", "description": "カメラ以外の視点からの鳥瞰図"}, {"term": "Test-Time Training", "description": "推論中の学習"}, {"term": "Linear RNN", "description": "高効率順次モデル"}]',
  info1_terms_zh = '[{"term": "LLM", "description": "大型语言模型"}, {"term": "Transformer", "description": "句子理解和生成模型架构"}, {"term": "Attention", "description": "专注于重要单词的操作"}, {"term": "Softmax", "description": "转换为概率的函数"}, {"term": "Linear Attention", "description": "计算复杂度有限的注意力"}, {"term": "RNN", "description": "顺序神经网络"}, {"term": "SSM", "description": "时间信息存储的状态空间模型"}, {"term": "Sparse", "description": "只计算部分内容的方法"}, {"term": "MoE", "description": "专家混合，只激活部分模型"}, {"term": "Hybrid", "description": "结合多种架构"}, {"term": "Diffusion", "description": "使用渐进变化的生成模型"}, {"term": "Multimodal", "description": "整合多种数据类型"}, {"term": "Autoregressive", "description": "顺序生成方法"}, {"term": "Quantized", "description": "降低精度，节省内存"}, {"term": "U-Net", "description": "图像处理模型"}, {"term": "RWKV", "description": "高效的状态空间模型"}, {"term": "MambaBEV", "description": "自注意力图像处理模型"}, {"term": "BEV", "description": "非相机视角的鸟瞰图"}, {"term": "Test-Time Training", "description": "推理期间的学习"}, {"term": "Linear RNN", "description": "高能效顺序模型"}]'
WHERE date = '2025-08-15';

-- 3. 업데이트 확인
SELECT 
  date,
  info1_title_ko,
  info1_title_en,
  info1_title_ja,
  info1_title_zh
FROM ai_info 
WHERE date IN ('2025-08-21', '2025-08-14', '2025-08-15');
