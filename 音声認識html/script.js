document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const resultParagraph = document.getElementById('result');
    const audioPlayer = document.getElementById('audioPlayer');

    // Web Speech API の準備
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    // ブラウザが音声認識APIをサポートしているか確認
    if (!SpeechRecognition) {
        resultParagraph.textContent = 'お使いのブラウザは音声認識APIをサポートしていません。Google Chromeなどの最新ブラウザをご利用ください。';
        startButton.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();

    // 認識するキーワードを定義 (この部分は補助的な役割です)
    const grammar = '#JSGF V1.0; grammar music; public <song> = どんぐりころころ | いとまき | きょだいなきょだいな | こいのぼり ;';
    speechRecognitionList.addFromString(grammar, 1);

    recognition.grammars = speechRecognitionList;
    recognition.continuous = false; // 発話ごとに認識を終了
    recognition.lang = 'ja-JP';     // 日本語を指定
    recognition.interimResults = false; // 中間結果は不要
    recognition.maxAlternatives = 1; // 最も確度の高い結果のみを取得

    // 曲名、考えられる別名(エイリアス)、ファイルパスをまとめたデータ構造
    const songData = [
        {
            key: 'どんぐりころころ',
            aliases: ['どんぐりころころ', 'どんぐりコロコロ', 'ドングリコロコロ'],
            file: 'donguri_korokoro.mp3'
        },
        {
            key: 'いとまき',
            aliases: ['いとまき', '糸巻き', 'イトマキ'],
            file: 'itomaki.mp3'
        },
        {
            key: 'きょだいなきょだいな',
            aliases: ['きょだいなきょだいな', '巨大な巨大な'],
            file: 'kyodaina_kyodaina.mp3'
        },
        {
            key: 'こいのぼり',
            aliases: ['こいのぼり', '鯉のぼり', 'コイノボリ'],
            file: 'koinobori.mp3'
        }
    ];

    startButton.addEventListener('click', () => {
        resultParagraph.textContent = '準備中... マイクに向かって曲名を話してください。';
        startButton.disabled = true; // 認識中はボタンを無効化
        recognition.start();
    });

    // === ここからが修正された中心部分です ===
    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim();
        resultParagraph.textContent = `認識しました: ${command}`;

        // エイリアスのいずれかが認識結果に含まれているかチェック
        const foundSong = songData.find(song =>
            song.aliases.some(alias => command.includes(alias))
        );

        if (foundSong) {
            audioPlayer.src = foundSong.file;
            audioPlayer.play()
                .then(() => {
                    resultParagraph.textContent += ` 「${foundSong.key}」を再生します。`;
                })
                .catch(error => {
                    resultParagraph.textContent += ` 曲の再生中にエラーが発生しました: ${error.message}`;
                    console.error('Audio play error:', error);
                });
        } else {
            resultParagraph.textContent += ' 対応する曲が見つかりませんでした。';
        }
    };
    // === ここまでが修正された中心部分です ===

    recognition.onspeechend = () => {
        recognition.stop();
        startButton.disabled = false; // 認識終了後、ボタンを有効化
    };

    recognition.onerror = (event) => {
        startButton.disabled = false; // エラー時もボタンを有効化
        resultParagraph.textContent = `音声認識エラー: ${event.error}`;
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            resultParagraph.textContent += ' マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。';
        } else if (event.error === 'no-speech') {
            resultParagraph.textContent += ' 音声が検出されませんでした。もう一度お試しください。';
        }
    };

    recognition.onnomatch = () => {
        resultParagraph.textContent = 'ごめんなさい、うまく聞き取れませんでした。もう一度お話しください。';
    };
});