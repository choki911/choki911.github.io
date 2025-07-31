document.addEventListener('DOMContentLoaded', () => {
    const gamepadStatus = document.getElementById('gamepadStatus');
    const vibrateButtons = document.querySelectorAll('.buttons button');
    let connectedGamepad = null;

    // ゲームパッド接続/切断イベントのリスナー
    window.addEventListener("gamepadconnected", (e) => {
        console.log("ゲームパッドが接続されました:", e.gamepad.id);
        connectedGamepad = e.gamepad;
        gamepadStatus.textContent = `ゲームパッド接続済: ${e.gamepad.id}`;
        enableButtons();
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("ゲームパッドが切断されました:", e.gamepad.id);
        connectedGamepad = null;
        gamepadStatus.textContent = "ゲームパッドが接続されていません。";
        disableButtons();
    });

    // 初期ロード時に既にゲームパッドが接続されているか確認
    function checkGamepads() {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (gp && gp.vibrationActuator) { // 振動機能を持つゲームパッドを探す
                connectedGamepad = gp;
                gamepadStatus.textContent = `ゲームパッド接続済: ${gp.id}`;
                enableButtons();
                console.log("既存のゲームパッドを検出しました:", gp.id);
                return;
            }
        }
        gamepadStatus.textContent = "ゲームパッドが接続されていません。";
        disableButtons();
    }

    // ボタンを有効化する関数
    function enableButtons() {
        vibrateButtons.forEach(button => {
            button.disabled = false;
        });
    }

    // ボタンを無効化する関数
    function disableButtons() {
        vibrateButtons.forEach(button => {
            button.disabled = true;
        });
    }

    // 各ボタンにクリックイベントリスナーを追加
    vibrateButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (connectedGamepad && connectedGamepad.vibrationActuator) {
                const pattern = parseInt(button.dataset.pattern);
                vibrateGamepad(pattern);
            } else {
                alert("振動機能を持つゲームパッドが接続されていません。");
            }
        });
    });

    // ゲームパッドを振動させる関数
    function vibrateGamepad(pattern) {
        if (!connectedGamepad || !connectedGamepad.vibrationActuator) {
            console.warn("振動機能を持つゲームパッドが接続されていません。");
            return;
        }

        const actuator = connectedGamepad.vibrationActuator;

        switch (pattern) {
            case 1:
                console.log("振動パターン 1: 短い振動");
                actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 200, // 200ms振動
                    weakMagnitude: 1.0, // 弱いモーターを最大に
                    strongMagnitude: 0.0 // 強いモーターは使わない
                });
                break;
            case 2:
                console.log("振動パターン 2: 長い振動");
                actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 500, // 500ms振動
                    weakMagnitude: 0.5,
                    strongMagnitude: 0.5
                });
                break;
            case 3:
                console.log("振動パターン 3: 強弱のある振動");
                actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 400,
                    weakMagnitude: 1.0,
                    strongMagnitude: 1.0 // 両方のモーターを最大に
                });
                break;
            case 4:
                console.log("振動パターン 4: ドクンドクン（心拍）");
                // 複数の効果を配列で指定して連続再生
                actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 100, weakMagnitude: 0.8, strongMagnitude: 0.8
                }).then(() => {
                    setTimeout(() => {
                        actuator.playEffect("dual-rumble", {
                            startDelay: 0,
                            duration: 100, weakMagnitude: 0.8, strongMagnitude: 0.8
                        });
                    }, 300); // 300msの休止後、2回目の振動
                });
                break;
            case 5:
                console.log("振動パターン 5: 連続的な小刻み振動");
                 actuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 100, weakMagnitude: 0.2, strongMagnitude: 0.8 // 弱いモーターは弱く、強いモーターは強く
                }).then(() => {
                    setTimeout(() => {
                        actuator.playEffect("dual-rumble", {
                            startDelay: 0,
                            duration: 100, weakMagnitude: 0.8, strongMagnitude: 0.2 // 今度は逆
                        });
                    }, 150); // 短い休止
                }).then(() => {
                     setTimeout(() => {
                        actuator.playEffect("dual-rumble", {
                            startDelay: 0,
                            duration: 100, weakMagnitude: 0.2, strongMagnitude: 0.8
                        });
                    }, 300); // さらに短い休止
                });
                break;
            default:
                console.log("未知の振動パターン");
                break;
        }
    }

    // ページロード時にゲームパッドの接続状態を一度チェック
    checkGamepads();
});